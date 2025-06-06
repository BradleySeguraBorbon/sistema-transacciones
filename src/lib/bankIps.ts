// Si ya tenías el archivo puedes mantenerlo; aquí queda completo
export interface BankIpInput {
  bankCode: string;
  ip: string;
}

// Para producción podrías leerlos de la DB o de variables de entorno.
// De momento será un objeto en memoria (rápido para pruebas).
const bankIps: Record<string, string> = {
  '0150': 'http://192.168.1.10', // BAC
  '0241': 'https://192.168.5.10:5050', // BCR
  '0052': 'http://192.168.1.12', // Popular
};

export function getBankIp(bankCode: string): string | null {
  return bankIps[bankCode] ?? null;
}
