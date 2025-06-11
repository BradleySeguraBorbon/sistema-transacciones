import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const body = await req.json();
  const { id, name, phone, password, isAdmin = false } = body;

  if (!id || !name || !phone || !password) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { id, name, phone, password: hashed, isAdmin },
  });

  return NextResponse.json({ success: true, user });
}