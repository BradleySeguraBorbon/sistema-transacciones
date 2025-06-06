export interface CentralLookupResponse {
  account_number: string;
  bank_code: string;
  name: string;
}

export async function lookupPhoneCentral(phone: string) {
  const url = `${process.env.CENTRAL_REGISTRY_URL}/lookup?phone=${phone}`;
  const res = await fetch(url);

  if (!res.ok) {
    if (res.status === 404) throw new Error('Phone not affiliated to SINPE-móvil');
    throw new Error(`Central registry error ${res.status}`);
  }

  return (await res.json()) as CentralLookupResponse;
}
