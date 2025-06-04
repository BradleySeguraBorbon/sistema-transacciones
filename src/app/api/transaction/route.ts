import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('[GET_TRANSACTIONS]', error);
    return NextResponse.json(
      { error: 'No se pudieron obtener las transacciones' },
      { status: 500 }
    );
  }
}
