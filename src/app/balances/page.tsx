'use client'

import { useEffect, useState } from 'react';

interface Account {
  account_number: string;
  name: string;
  phone_number: string;
  bank_code: string;
  balance: number;
  createdAt: string;
}

export default function BalancesPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    fetch('/api/accounts')
      .then(res => res.json())
      .then(data => setAccounts(data));
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-6 text-black">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">Saldos de Cuentas</h1>
        <table className="min-w-full text-left border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Cuenta</th>
              <th className="p-2 border">Nombre</th>
              <th className="p-2 border">Teléfono</th>
              <th className="p-2 border">Código Banco</th>
              <th className="p-2 border">Saldo (CRC)</th>
              <th className="p-2 border">Creado</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((acc) => (
              <tr key={acc.account_number}>
                <td className="p-2 border">{acc.account_number}</td>
                <td className="p-2 border">{acc.name}</td>
                <td className="p-2 border">{acc.phone_number}</td>
                <td className="p-2 border">{acc.bank_code}</td>
                <td className="p-2 border">₡{acc.balance.toLocaleString()}</td>
                <td className="p-2 border">{new Date(acc.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
