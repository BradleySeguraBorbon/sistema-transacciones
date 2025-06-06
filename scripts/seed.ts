import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const now = new Date();

  await prisma.bank.createMany({
    data: [
      {
        bank_code: '0050',
        name: 'Banco BSM',
        ip: '192.168.0.1',
        createdAt: now,
      }
    ]
  });

  await prisma.account.createMany({
    data: [
      {
        account_number: 'CR2100500001000000001234',
        name: 'Juan Pérez',
        phone_number: '70112233',
        bank_code: '0050',
        balance: 1000,
        createdAt: now,
      },
      {
        account_number: 'CR2100500001000000005678',
        name: 'Ana Gómez',
        phone_number: '70112234',
        bank_code: '0050',
        balance: 25000,
        createdAt: now,
      },
      {
        account_number: 'CR2100500001000000006849',
        name: 'Luis Cordero',
        phone_number: '88887777',
        bank_code: '0050',
        balance: 8000,
        createdAt: now,
      },
      {
        account_number: 'CCR210050000100000015498',
        name: 'Pedro Abarca',
        phone_number: '88887788',
        bank_code: '0050',
        balance: 3500,
        createdAt: now,
      },
    ],
  });

  console.log('Bancos y cuentas creadas exitosamente ✅');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
