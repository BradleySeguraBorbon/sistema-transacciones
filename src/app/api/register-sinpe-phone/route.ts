import { NextResponse } from 'next/server';
import { registerSinpePhone } from '@/lib/lookupSinpe';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone_number, client_name } = body;

    if (!phone_number || !client_name) {
      return NextResponse.json({ error: 'Missing phone_number or client_name' }, { status: 400 });
    }

    // Verificar si existe en el banco local
    const localClient = await prisma.account.findUnique({
      where: { phone_number },
    });

    if (!localClient) {
      return NextResponse.json({ error: 'Phone number not associated with any account in this bank' }, { status: 404 });
    }

    const result = await registerSinpePhone({
      phone_number,
      client_name,
      bank_code: localClient.bank_code,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (err: any) {
    console.error('[REGISTER_SINPE_PHONE]', err);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
