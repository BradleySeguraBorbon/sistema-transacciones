import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const now = new Date();

  await prisma.transaction.createMany({
    data: [
      {
        transaction_id: 'tx-001',
        timestamp: new Date(now.getTime() - 3600000),
        sender_account_number: '11111111',
        sender_name: 'Carlos López',
        sender_bank_code: 'BCR',
        receiver_account_number: '22222222',
        receiver_name: 'Ana Pérez',
        receiver_bank_code: 'BAC',
        amount_value: 5000,
        amount_currency: 'CRC',
        description: 'Pago de alquiler',
        hmac_md5: 'dummyhmac1',
      },
      {
        transaction_id: 'tx-002',
        timestamp: new Date(now.getTime() - 7200000),
        sender_account_number: '33333333',
        sender_name: 'María Rojas',
        sender_bank_code: 'BAC',
        receiver_account_number: '44444444',
        receiver_name: 'Pedro Díaz',
        receiver_bank_code: 'BCR',
        amount_value: 2500,
        amount_currency: 'CRC',
        description: 'Transferencia familiar',
        hmac_md5: 'dummyhmac2',
      },
      {
        transaction_id: 'tx-003',
        timestamp: now,
        sender_account_number: '55555555',
        sender_name: 'Juan Pérez',
        sender_bank_code: 'BCR',
        receiver_account_number: '66666666',
        receiver_name: 'Laura Jiménez',
        receiver_bank_code: 'BAC',
        amount_value: 1800,
        amount_currency: 'CRC',
        description: 'Compra en línea',
        hmac_md5: 'dummyhmac3',
      },
    ],
  });

  console.log('Transacciones de prueba insertadas ✅');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
