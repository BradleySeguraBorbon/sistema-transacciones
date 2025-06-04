import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateTransactionPayload } from '@/lib/transferHelpers';

export async function POST(req: Request) {
  const body = await req.json();
  const { valid, error } = validateTransactionPayload(body);
  if (!valid) return NextResponse.json({ error }, { status: 400 });

  const { transaction_id, timestamp, sender, receiver, amount, description, hmac_md5 } = body;

  const receiverAccount = await prisma.account.findUnique({
    where: { account_number: receiver.account_number },
  });

  if (!receiverAccount) {
    return NextResponse.json({ error: 'Receiver account not found' }, { status: 404 });
  }

  await prisma.account.update({
    where: { account_number: receiver.account_number },
    data: { balance: { increment: amount.value } },
  });

  await prisma.transaction.create({
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

  return NextResponse.json({ success: true });
}
