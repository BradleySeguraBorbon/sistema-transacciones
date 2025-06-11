import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const { id, password } = await req.json();
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    user: { id: user.id, name: user.name, phone: user.phone, isAdmin: user.isAdmin },
  });
}