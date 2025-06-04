import crypto from 'crypto';

interface HmacInput {
  account_identifier: string;
  timestamp: string;
  transaction_id: string;
  amount_value: number;
}

export function generateHmacMD5({ account_identifier, timestamp, transaction_id, amount_value }: HmacInput): string {
  const secret = process.env.SECRET_KEY!;
  const data = `${account_identifier},${timestamp},${transaction_id},${amount_value}`;
  return crypto.createHmac('md5', secret).update(data).digest('hex');
}

export function validateTransactionPayload(body: any): { valid: boolean; error?: string } {
  if (!body || typeof body !== 'object') return { valid: false, error: 'Missing body' };

  const requiredFields = [
    'version',
    'timestamp',
    'transaction_id',
    'sender',
    'receiver',
    'amount',
    'description',
    'hmac_md5',
  ];

  for (const field of requiredFields) {
    if (!body[field]) return { valid: false, error: `Missing field: ${field}` };
  }

  const senderValid = body.sender.account_number || body.sender.phone_number;
  const receiverValid = body.receiver.account_number || body.receiver.phone_number;
  const amountValid = typeof body.amount.value === 'number' && body.amount.currency;

  if (!senderValid) return { valid: false, error: 'Missing sender identifier' };
  if (!receiverValid) return { valid: false, error: 'Missing receiver identifier' };
  if (!amountValid) return { valid: false, error: 'Invalid amount' };

  return { valid: true };
}
