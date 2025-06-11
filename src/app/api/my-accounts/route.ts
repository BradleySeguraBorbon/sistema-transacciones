import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cedula = searchParams.get('cedula');
  if (!cedula) return NextResponse.json({ error: 'Cédula requerida' }, { status: 400 });

  const accounts = await prisma.account.findMany({
    where: { owner_id: cedula },
    select: {
      account_number: true,
      bank_code: true,
      balance: true,
      phone_number: true
    },
  });

  return NextResponse.json(accounts);
}