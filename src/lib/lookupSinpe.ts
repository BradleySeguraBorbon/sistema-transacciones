// lib/lookupSinpe.ts
import { Client } from 'pg';

function createClient() {
  return new Client({
    user: 'redes',
    host: '192.168.1.10',
    database: 'BCCR',
    password: 'redes01',
    port: 5432,
  });
}

export async function lookupSinpePhone(phone: string) {
  const client = createClient();
  await client.connect();

  const res = await client.query(
    'SELECT sinpe_number, sinpe_client_name, sinpe_bank_code FROM sinpe_subscriptions WHERE sinpe_number = $1',
    [phone]
  );

  await client.end();
  if (res.rows.length === 0) return null;

  return {
    phone_number: res.rows[0].sinpe_number,
    name: res.rows[0].sinpe_client_name,
    bank_code: res.rows[0].sinpe_bank_code,
  };
}

export async function registerSinpePhone({
  phone_number,
  client_name,
  bank_code,
}: {
  phone_number: string;
  client_name: string;
  bank_code: string;
}) {
  const client = createClient();
  await client.connect();

  try {
    const res = await client.query(
      `
      INSERT INTO sinpe_subscriptions (sinpe_number, sinpe_client_name, sinpe_bank_code)
      VALUES ($1, $2, $3)
      RETURNING sinpe_number, sinpe_client_name, sinpe_bank_code
      `,
      [phone_number, client_name, bank_code]
    );

    await client.end();
    return {
      success: true,
      data: {
        phone_number: res.rows[0].sinpe_number,
        name: res.rows[0].sinpe_client_name,
        bank_code: res.rows[0].sinpe_bank_code,
      },
    };
  } catch (e: any) {
    await client.query('ROLLBACK').catch(() => {});
    await client.end();
    return {
      success: false,
      error: e.message,
    };
  }
}
