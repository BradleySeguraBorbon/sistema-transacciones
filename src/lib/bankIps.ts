// Si ya tenías el archivo puedes mantenerlo; aquí queda completo
export interface BankIpInput {
  bankCode: string;
  ip: string;
}

// Para producción podrías leerlos de la DB o de variables de entorno.
// De momento será un objeto en memoria (rápido para pruebas).
const bankIps: Record<string, string> = {
  '0150': 'https://192.168.2.10:3443', //Me
  '0241': 'https://192.168.4.10:5050', // BRAYAN
  '0119': 'https://192.168.4.10:3443', //Marconi
  '0876': 'https://192.168.3.10:5000', //Josué
  '0152': 'https://192.168.1.10:3443' //Kendall
};

export function getBankIp(bankCode: string): string | null {
  return bankIps[bankCode] ?? null;
}
