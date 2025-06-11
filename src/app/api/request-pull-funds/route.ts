import { NextResponse } from 'next/server';
import { getBankIp } from '@/lib/bankIps';
import { prisma } from '@/lib/prisma';
import { Agent, fetch as undiciFetch } from 'undici';

export async function POST(req: Request) {
  try {
    const { account_number, cedula, monto } = await req.json();

    if (!account_number || !cedula || !monto) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    const codigoBanco = account_number.slice(4, 8);
    const ipRemota = getBankIp(codigoBanco);
    if (!ipRemota) {
      return NextResponse.json({ error: 'Banco remoto no encontrado' }, { status: 400 });
    }

    const url = `${ipRemota}/api/pull-funds`;
    const payload = { account_number, cedula, monto };

    const agent = new Agent({ connect: { rejectUnauthorized: false } });
    const res = await undiciFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      dispatcher: agent,
    });

    const data = await res.json() as { status: string };
    if (res.status === 200 && data.status === 'ACK') {
      // Aumentar saldo en cuenta local
      await prisma.account.updateMany({
        where: { 
          owner_id: cedula,
          NOT: { phone_number: null },
         },
        data: { balance: { increment: monto } },
      });

      return NextResponse.json({ success: true, message: 'Fondos solicitados exitosamente' });
    } else {
      return NextResponse.json({ error: 'Error solicitando fondos', status: 'NACK' }, { status: 400 });
    }
  } catch (err: any) {
    console.error('[REQUEST_PULL_FUNDS]', err);
    return NextResponse.json({ error: 'Error solicitando fondos' }, { status: 500 });
  }
}
