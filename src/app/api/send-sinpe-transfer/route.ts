import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateHmacMD5, validateTransactionPayload } from '@/lib/transferHelpers';
import { getBankIp } from '@/lib/bankIps';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    /* 1. Validación del payload */
    const { valid, error } = validateTransactionPayload(body);
    if (!valid) return NextResponse.json({ error }, { status: 400 });

    const { transaction_id, timestamp, sender, receiver, amount, description } = body;

    /* 2. Verificar cuenta y saldo remitente en TU banco */
    const senderAccount = await prisma.account.findUnique({
      where: { account_number: sender.account_number },
    });
    if (!senderAccount || senderAccount.balance < amount.value) {
      return NextResponse.json(
        { error: 'Sender not found or insufficient funds' },
        { status: 400 }
      );
    }

    /* 3. Obtener IP del banco destino a partir del bankCode que
          el usuario ingresa en el formulario */
    const destIp = getBankIp(receiver.bank_code);
    if (!destIp) {
      return NextResponse.json(
        { error: `IP not configured for bank ${receiver.bank_code}` },
        { status: 400 }
      );
    }

    /* 4. Generar HMAC utilizado por el banco remoto */
    const hmac_md5 = generateHmacMD5({
      account_identifier: sender.account_number,
      timestamp,
      transaction_id,
      amount_value: amount.value,
    });

    /* 5. Descontar saldo de forma transaccional */
    await prisma.$transaction(async (tx) => {
      await tx.account.update({
        where: { account_number: sender.account_number },
        data: { balance: { decrement: amount.value } },
      });

      /* 6. Llamar al banco destino */
      const remoteRes = await fetch(`${destIp}/api/sinpe-transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: '1.0',
          transaction_id,
          timestamp,
          sender,
          receiver,
          amount,
          description,
          hmac_md5,
        }),
      });

      if (!remoteRes.ok) {
        /* Revertir si el banco destino falla */
        throw new Error(`Remote bank error ${remoteRes.status}`);
      }

      /* 7. Registrar transacción local */
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
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[SEND_TRANSFER]', err);
    return NextResponse.json({ error: 'Transfer failed' }, { status: 500 });
  }
}
