export function generateIban(): string {
  const fixedPrefix = 'CR2101500001'; // CR21 + 0150 + 0001
  const randomPart = Math.floor(100000000000 + Math.random() * 900000000000)
    .toString()
    .padStart(12, '0');

  return fixedPrefix + randomPart;
}
