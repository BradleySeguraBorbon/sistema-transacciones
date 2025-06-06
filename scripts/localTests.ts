import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();
const API = 'http://localhost:3000';         // Next corre en 3000

/* helpers ----------------------------------------------------------------- */
async function getBalance(acc: string) {
  return (await prisma.account.findUnique({ where: { account_number: acc } }))!.balance;
}
async function getBalanceByPhone(phone: string) {
  return (await prisma.account.findUnique({ where: { phone_number: phone } }))!.balance;
}

/* pruebas ----------------------------------------------------------------- */
async function testHealth() {
  const r = await fetch(`${API}/api/health`);
  if (!r.ok) throw new Error('health FAIL');
  console.log('✓ /api/health OK');
}

async function testSinpeTransfer() {
  const payload = {
    version: '1.0',
    transaction_id: 'tx-sinpe-acc-001',
    timestamp: new Date().toISOString(),
    sender: { account_number: 'EXT-0001', bank_code: '9999', name: 'Banco Ext' },
    receiver: { account_number: 'CR2100500001000000001234', bank_code: '0050', name: 'Juan Pérez' },
    amount: { value: 500, currency: 'CRC' },
    description: 'Ingreso prueba cuenta',
    hmac_md5: 'dummy',
  };

  const before = await getBalance(payload.receiver.account_number);

  const res = await fetch(`${API}/api/sinpe-transfer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const after = await getBalance(payload.receiver.account_number);

  if (res.ok && after === before + 500) {
    console.log('✓ /api/sinpe-transfer (cuenta) OK');
  } else {
    const body = await res.json().catch(() => ({}));
    throw new Error('sinpe-transfer FAIL → ' + JSON.stringify(body));
  }
}

async function testSinpeMovilTransfer() {
  const payload = {
    transaction_id: 'tx-sinpe-mov-001',
    timestamp: new Date().toISOString(),
    sender: { phone_number: '88880001', bank_code: '9999', name: 'Banco Ext' },
    receiver: { phone_number: '70112233', bank_code: '0050' }, // teléfono de Juan Pérez
    amount: { value: 250, currency: 'CRC' },
    description: 'Ingreso prueba móvil',
    hmac_md5: 'dummy',
  };

  const before = await getBalanceByPhone(payload.receiver.phone_number);

  const res = await fetch(`${API}/api/sinpe-movil-transfer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const after = await getBalanceByPhone(payload.receiver.phone_number);

  if (res.ok && after === before + 250) {
    console.log('✓ /api/sinpe-movil-transfer (teléfono) OK');
  } else {
    const body = await res.json().catch(() => ({}));
    throw new Error('sinpe-movil-transfer FAIL → ' + JSON.stringify(body));
  }
}

async function testBadAccount() {
  const badPayload = {
    version: '1.0',
    transaction_id: 'tx-bad-acc',
    timestamp: new Date().toISOString(),
    sender: { account_number: 'EXT-0002', bank_code: '9999', name: 'Banco Ext' },
    receiver: { account_number: 'ZZZ', bank_code: '0050', name: 'Desconocido' },
    amount: { value: 100, currency: 'CRC' },
    description: 'Cuenta inexistente',
    hmac_md5: 'dummy',
  };

  const res = await fetch(`${API}/api/sinpe-transfer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(badPayload),
  });

  if (res.status === 404) {
    console.log('✓ cuenta inexistente devuelve 404');
  } else {
    const body = await res.json().catch(() => ({}));
    throw new Error('bad account FAIL → ' + JSON.stringify(body));
  }
}

/* ejecutar ---------------------------------------------------------------- */
(async () => {
  try {
    await testHealth();
    await testSinpeTransfer();
    await testSinpeMovilTransfer();
    await testBadAccount();
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
    process.exit();
  }
})();
