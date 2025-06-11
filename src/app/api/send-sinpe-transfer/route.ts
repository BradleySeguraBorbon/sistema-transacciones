import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateHmacMD5, validateTransactionPayload } from '@/lib/transferHelpers';
import { getBankIp } from '@/lib/bankIps';
import crypto from 'crypto';
import { Agent, fetch as undiciFetch } from 'undici';

/* Helper ────────────────────────────────────────────────────────────── */
function extractBankCode(account: string) {
  const match = account.match(/^CR21(\d{4})/);
  return match ? match[1] : '';
}

export async function POST(req: Request) {
  try {
    /* 0. Leer SOLO lo que envió el front */
    const body = await req.json(); // may contain senderAccount, receiverAccount, amount, description…

    /* 0-bis. Pequeña validación mínima (campos obligatorios) */
    if (
      !body?.sender?.account_number ||
      !body?.receiver?.account_number ||
      !body?.amount?.value
    ) {
      return NextResponse.json(
        { error: 'Missing sender, receiver or amount' },
        { status: 400 },
      );
    }

    /** -----------------------------------------------------------------
     * 1. Recuperar datos del remitente en TU banco
     * ----------------------------------------------------------------- */
    const senderAccount = await prisma.account.findUnique({
      where: { account_number: body.sender.account_number },
    });
    if (!senderAccount)
      return NextResponse.json({ error: 'Sender not found' }, { status: 404 });

    if (senderAccount.balance < body.amount.value)
      return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });

    /** -----------------------------------------------------------------
     * 2. Derivar y componer TODOS los campos requeridos
     * ----------------------------------------------------------------- */
    const transaction_id = body.transaction_id ?? crypto.randomUUID();
    const timestamp = body.timestamp ?? new Date().toISOString();

    const receiverBankCode = extractBankCode(body.receiver.account_number);
    if (!receiverBankCode)
      return NextResponse.json({ error: 'Invalid receiver IBAN' }, { status: 400 });

    const sender = {
      account_number: senderAccount.account_number,
      bank_code: senderAccount.bank_code,
      name: senderAccount.name,                // usamos el nombre almacenado
    };

    const receiver = {
      account_number: body.receiver.account_number,
      bank_code: receiverBankCode,
      name: body.receiver.name ?? '',          // opcional
    };

    const amount = {
      value: body.amount.value,
      currency: body.amount.currency ?? 'CRC',
    };

    const description = body.description ?? '';

    /** -----------------------------------------------------------------
     * 3. Bank-to-bank routing
     * ----------------------------------------------------------------- */
    const destIp = getBankIp(receiver.bank_code);
    if (!destIp)
      return NextResponse.json(
        { error: `IP not configured for bank ${receiver.bank_code}` },
        { status: 400 },
      );

    /** 4. HMAC sobre los campos obligatorios */
    const hmac_md5 = generateHmacMD5({
      account_identifier: sender.account_number,
      timestamp,
      transaction_id,
      amount_value: amount.value,
    });

    /** 5. Cuerpo COMPLETO para el banco destino */
    const remotePayload = {
      version: '1.0',
      transaction_id,
      timestamp,
      sender,
      receiver,
      amount,
      description,
      hmac_md5,
    };

    /* 5-bis. Validación interna: aseguramos que el JSON que enviamos
       cumple tu esquema rígido, sin exigirle eso al front. */
    const { valid, error } = validateTransactionPayload(remotePayload);
    if (!valid) {
      console.error('Generated payload invalid', error, remotePayload);
      return NextResponse.json({ error: 'Internal payload error' }, { status: 500 });
    }

    /** -----------------------------------------------------------------
     * 6. Operación transaccional local  +  llamada remota
     * ----------------------------------------------------------------- */
    await prisma.$transaction(async (tx) => {
      // Paso 1: Débito temporal
      await tx.account.update({
        where: { account_number: sender.account_number },
        data: { balance: { decrement: amount.value } },
      });

      const isSameBank = receiver.bank_code === '0150';

      let transferSuccess = false;

      if (isSameBank) {
        // Procesar internamente sin fetch
        await tx.account.update({
          where: { account_number: receiver.account_number },
          data: { balance: { increment: amount.value } },
        });

        transferSuccess = true;
      } else {
        const agent = new Agent({
          connect: {
            rejectUnauthorized: false
          }
        });

        // Paso 2: Enviar a banco receptor
        const remoteRes = await undiciFetch(`${destIp}/api/sinpe-transfer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(remotePayload),
          dispatcher: agent,
        });

        const remoteData: any = await remoteRes.json();

        // Paso 3: Si falla, rollback
        if (remoteData.status !== 'ACK') {
          await tx.account.update({
            where: { account_number: sender.account_number },
            data: { balance: { increment: amount.value } },
          });
          throw new Error(`Transfer failed on receiver bank: ${remoteData.message}`);
        }
        transferSuccess = true;
      }

      if (transferSuccess) {
        // Paso 4: Registrar transacción
        await tx.transaction.create({
          data: {
            transaction_id,
            timestamp: new Date(timestamp),
            sender_account_number: sender.account_number,
            sender_bank_code: sender.bank_code,
            sender_name: sender.name,
            receiver_account_number: receiver.account_number,
            receiver_bank_code: receiver.bank_code,
            receiver_name: receiver.name,
            amount_value: amount.value,
            amount_currency: amount.currency,
            description,
            hmac_md5,
          },
        });
      }
    });

    return NextResponse.json({ success: true });
    } catch (err: any) {
      console.error('[SEND_TRANSFER]', err);
      return NextResponse.json({ error: 'Transfer failed' }, { status: 500 });
    }
  }
