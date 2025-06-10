import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateTransactionPayload } from '@/lib/transferHelpers';
import { verifyHmacMD5 } from '@/lib/transferHelpers';

export async function POST(req: Request) {
  const body = await req.json();
  const { valid, error } = validateTransactionPayload(body);
  if (!valid) return NextResponse.json({ error }, { status: 400 });

  // ✅ VALIDAR HMAC
  if (!verifyHmacMD5(body)) {
    return NextResponse.json({ status: 'NACK', message: 'Invalid HMAC' }, { status: 400 });
  }

  const { transaction_id, timestamp, sender, receiver, amount, description, hmac_md5 } = body;

  /* 🟢 1. Todo en una sola transacción SQL */
  try {
    await prisma.$transaction(async (tx) => {
      /* 1.1 Buscar la cuenta receptora */
      const receiverAccount = await tx.account.findUnique({
        where: { account_number: receiver.account_number },
      });
      if (!receiverAccount)
        throw new Error('Receiver account not found');

      /* 1.2 Acreditar fondos */
      await tx.account.update({
        where: { account_number: receiver.account_number },
        data: { balance: { increment: amount.value } },
      });

      /* 1.3 Registrar transacción */
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

    return NextResponse.json({ status: 'ACK', message: 'Transferencia acreditada' });
  } catch (err: any) {
    console.error('[SINPE_TRANSFER]', err);
    return NextResponse.json({ status: 'NACK', message: "Error recibiendo la transacción" }, { status: 400 });
  }
}
