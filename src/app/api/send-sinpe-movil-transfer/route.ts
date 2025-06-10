import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateHmacMD5, validateTransactionPayload } from '@/lib/transferHelpers';
import { getBankIp } from '@/lib/bankIps';
import { lookupSinpePhone } from '@/lib/lookupSinpe';
import crypto from 'crypto';
import { Agent, fetch as undiciFetch } from 'undici';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (
      !body?.sender?.phone_number ||
      !body?.receiver?.phone_number ||
      !body?.amount?.value
    ) {
      return NextResponse.json(
        { error: 'Missing sender, receiver or amount' },
        { status: 400 },
      );
    }

    /** 1. Verificar existencia del remitente */
    const senderAccount = await prisma.account.findUnique({
      where: { phone_number: body.sender.phone_number },
    });
    if (!senderAccount)
      return NextResponse.json({ error: 'Sender not found' }, { status: 404 });

    if (senderAccount.balance < body.amount.value)
      return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });

    /** 2. Buscar receptor en PostgreSQL SINPE */
    const sinpeReceiver = await lookupSinpePhone(body.receiver.phone_number);
    if (!sinpeReceiver)
      return NextResponse.json({ error: 'Receiver not registered in SINPE' }, { status: 404 });

    const transaction_id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const sender = {
      phone_number: senderAccount.phone_number,
      bank_code: senderAccount.bank_code,
      name: senderAccount.name,
    };

    const receiver = {
      phone_number: sinpeReceiver.phone_number,
      bank_code: sinpeReceiver.bank_code,
      name: sinpeReceiver.name ?? '',
    };

    const amount = {
      value: body.amount.value,
      currency: body.amount.currency ?? 'CRC',
    };

    const description = body.description ?? '';

    const paddedBankCode = receiver.bank_code.padStart(4, '0');
    const destIp = getBankIp(paddedBankCode);
    if (!destIp) {
      return NextResponse.json(
        { error: `IP not configured for bank ${receiver.bank_code}` },
        { status: 400 },
      );
    }

    const hmac_md5 = generateHmacMD5({
      account_identifier: sender.phone_number,
      timestamp,
      transaction_id,
      amount_value: amount.value,
    });

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

    /*const { valid, error } = validateTransactionPayload(remotePayload);
    if (!valid) {
      console.error('Generated payload invalid', error, remotePayload);
      return NextResponse.json({ error: 'Internal payload error' }, { status: 500 });
    }*/

    await prisma.$transaction(async (tx) => {
      // Paso 1: Débito temporal
      await tx.account.update({
        where: { phone_number: sender.phone_number },
        data: { balance: { decrement: amount.value } },
      });

      const agent = new Agent({
        connect: {
          rejectUnauthorized: false,
        },
      });

      const remoteRes = await undiciFetch(`${destIp}/api/sinpe-movil-transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(remotePayload),
        dispatcher: agent,
      });

      const remoteData = await remoteRes.json() as { status?: string;[key: string]: any };

      // Paso 3: Evaluar respuesta
      if (remoteData.status !== 'ACK') {
        await tx.account.update({
          where: { phone_number: sender.phone_number },
          data: { balance: { increment: amount.value } },
        });
        return NextResponse.json({
          error: 'Transfer failed on receiver bank',
          details: remoteData,
        }, { status: 400 });
      }

      await tx.transaction.create({
        data: {
          transaction_id,
          timestamp: new Date(timestamp),
          sender_account_number: sender.phone_number,
          sender_bank_code: sender.bank_code,
          sender_name: sender.name,
          receiver_account_number: receiver.phone_number,
          receiver_bank_code: receiver.bank_code,
          receiver_name: receiver.name,
          amount_value: amount.value,
          amount_currency: amount.currency,
          description,
          hmac_md5,
        },
      });

      return NextResponse.json({ success: true });
    });

  } catch (err: any) {
    console.error('[SEND_SINPE_MOVIL]', err);
    return NextResponse.json({ error: 'Transfer failed' }, { status: 500 });
  }
}
