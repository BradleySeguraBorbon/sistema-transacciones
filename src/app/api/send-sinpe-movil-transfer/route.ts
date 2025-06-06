import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateHmacMD5, validateTransactionPayload } from '@/lib/transferHelpers';
import { getBankIp } from '@/lib/bankIps';
import { lookupPhoneCentral } from '@/lib/lookupPhoneCentral';


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { valid, error } = validateTransactionPayload(body);
    if (!valid) return NextResponse.json({ error }, { status: 400 });

    const { transaction_id, timestamp, sender, receiver, amount, description } = body;

    const senderAccount = await prisma.account.findUnique({
      where: { phone_number: sender.phone_number },
    });
    if (!senderAccount || senderAccount.balance < amount.value) {
      return NextResponse.json(
        { error: 'Sender not found or insufficient funds' },
        { status: 400 }
      );
    }

    /* 1. Pedimos al usuario el banco destino (código) y buscamos IP */
    const destIp = getBankIp(receiver.bank_code);
    if (!destIp) {
      return NextResponse.json(
        { error: `IP not configured for bank ${receiver.bank_code}` },
        { status: 400 }
      );
    }

    /* 2. Resolvemos teléfono receptor -> cuenta destino */
    const resolved = await lookupPhoneCentral(receiver.phone_number);

    const hmac_md5 = generateHmacMD5({
      account_identifier: sender.phone_number,
      timestamp,
      transaction_id,
      amount_value: amount.value,
    });

    await prisma.$transaction(async (tx) => {
      await tx.account.update({
        where: { phone_number: sender.phone_number },
        data: { balance: { decrement: amount.value } },
      });

      const remoteRes = await fetch(`${destIp}/api/sinpe-movil-transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: '1.0',
          transaction_id,
          timestamp,
          sender,
          receiver: resolved, // usamos cuenta real devuelta por lookup
          amount,
          description,
          hmac_md5,
        }),
      });

      if (!remoteRes.ok) throw new Error(`Remote bank error ${remoteRes.status}`);

      await tx.transaction.create({
        data: {
          transaction_id,
          timestamp: new Date(timestamp),
          sender_account_number: senderAccount.account_number,
          sender_bank_code: sender.bank_code,
          sender_name: sender.name,
          receiver_account_number: resolved.account_number,
          receiver_bank_code: resolved.bank_code,
          receiver_name: resolved.name,
          amount_value: amount.value,
          amount_currency: amount.currency,
          description,
          hmac_md5,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[SEND_SINPE_TRANSFER]', err);
    return NextResponse.json({ error: 'Transfer failed' }, { status: 500 });
  }
}
