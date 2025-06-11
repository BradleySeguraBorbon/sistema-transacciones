import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateIban } from '@/lib/generateIban';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ownerId = searchParams.get('owner_id');

  const accounts = await prisma.account.findMany({
    where: ownerId ? { owner_id: ownerId } : {},
  });

  return NextResponse.json(accounts);
}


export async function POST(req: Request) {
  try {
    const { owner_id } = await req.json();

    if (!owner_id) {
      return NextResponse.json({ error: 'owner_id requerido' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: owner_id } });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const alreadyHasSinpe = await prisma.account.findUnique({
      where: { phone_number: user.phone }, 
    });

    const account_number = generateIban();

    const phone_number = alreadyHasSinpe ? null : user.phone;

    const newAccount = await prisma.account.create({
      data: {
        account_number,
        bank_code: '0150',
        name: user.name,
        phone_number,
        balance: 0,
        owner_id: user.id,
      },
    });

    return NextResponse.json({ success: true, account: newAccount });
  } catch (err: any) {
    console.error('[CREATE_ACCOUNT]', err);
    return NextResponse.json({ error: 'Error creando cuenta' }, { status: 500 });
  }
}
