import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateHmacMD5, validateTransactionPayload } from '@/lib/transferHelpers';

async function resolvePhoneToAccount(phone_number: string) {
  const res = await fetch(`${process.env.SINPE_API_URL}/lookup?phone=${phone_number}`);
  if (!res.ok) return null;
  return await res.json(); // { account_number, bank_code, name }
}

export async function POST(req: Request) {
  const body = await req.json();
  const { valid, error } = validateTransactionPayload(body);
  if (!valid) return NextResponse.json({ error }, { status: 400 });

  const { transaction_id, timestamp, sender, receiver, amount, description, hmac_md5 } = body;

  const resolvedReceiver = await resolvePhoneToAccount(receiver.phone_number);
  if (!resolvedReceiver) {
    return NextResponse.json({ error: 'Receiver phone not registered in SINPE' }, { status: 404 });
  }

  const calculatedHmac = generateHmacMD5({
    account_identifier: sender.phone_number,
    timestamp,
    transaction_id,
    amount_value: amount.value,
  });

  if (calculatedHmac !== hmac_md5) {
    return NextResponse.json({ error: 'Invalid HMAC' }, { status: 400 });
  }

  const senderAccount = await prisma.account.findUnique({
    where: { phone_number: sender.phone_number },
  });

  if (!senderAccount || senderAccount.balance < amount.value) {
    return NextResponse.json({ error: 'Insufficient funds or sender not found' }, { status: 400 });
  }

  await prisma.account.update({
    where: { phone_number: sender.phone_number },
    data: { balance: { decrement: amount.value } },
  });

  await prisma.transaction.create({
    data: {
      transaction_id,
      timestamp: new Date(timestamp),
      sender_account_number: senderAccount.account_number,
      sender_bank_code: sender.bank_code,
      sender_name: sender.name,
      receiver_account_number: resolvedReceiver.account_number,
      receiver_bank_code: resolvedReceiver.bank_code,
      receiver_name: resolvedReceiver.name,
      amount_value: amount.value,
      amount_currency: amount.currency,
      description,
      hmac_md5,
    },
  });

  return NextResponse.json({ success: true });
}
