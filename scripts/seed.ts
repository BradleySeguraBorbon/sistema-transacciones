import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const now = new Date();

  await prisma.bank.createMany({
    data: [
      {
        bank_code: '0150',
        name: 'Banco BSM',
        ip: '192.168.3.2',
        createdAt: now,
      }
    ]
  });

  await prisma.account.createMany({
    data: [
      {
        account_number: 'CR2101500001000000001234',
        name: 'Marco Fallas',
        phone_number: '70112233',
        bank_code: '0150',
        balance: 1000,
        createdAt: now,
      }

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
