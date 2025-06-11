import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { account_number, cedula, monto } = await req.json();

    if (!account_number || !cedula || monto == null) {
      return NextResponse.json({ status: 'NACK', message: 'Campo faltante' }, { status: 400 });
    }

    const account = await prisma.account.findUnique({
      where: { account_number },
    });

    if (!account) {
      return NextResponse.json({ status: 'NACK', message: 'Cuenta no encontrada' }, { status: 404 });
    }

    if (account.owner_id !== cedula) {
      return NextResponse.json({ status: 'NACK', message: 'Cédula no coincide con la cuenta' }, { status: 403 });
    }

    if (account.balance < monto) {
      return NextResponse.json({ status: 'NACK', message: 'Fondos insuficientes' }, { status: 400 });
    }

    await prisma.account.update({
      where: { account_number },
      data: { balance: { decrement: monto } },
    });

    return NextResponse.json({ status: 'ACK', message: 'Fondos transferidos' });
  } catch (err: any) {
    console.error('[PULL_FUNDS_RECEIVE]', err);
    return NextResponse.json({ status: 'NACK', message: 'Error interno' }, { status: 500 });
  }
}