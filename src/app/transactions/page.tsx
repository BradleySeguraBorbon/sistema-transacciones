'use client'

import React, { useEffect, useState } from 'react';

interface Transaction {
  transaction_id: string;
  timestamp: string;
  sender_account_number: string;
  sender_name: string;
  receiver_account_number: string;
  receiver_name: string;
  amount_value: number;
  amount_currency: string;
  description: string;
}

const TransactionList = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch('/api/transaction');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al obtener transacciones');
        setTransactions(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div className="max-w-7xl mx-auto mt-10 p-4 bg-white shadow-md rounded-lg text-black">
      <h2 className="text-2xl font-semibold mb-4">Transacciones Registradas</h2>

      {loading && <p className="text-gray-600">Cargando transacciones...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Fecha</th>
                <th className="px-4 py-2">Remitente</th>
                <th className="px-4 py-2">Receptor</th>
                <th className="px-4 py-2">Monto</th>
                <th className="px-4 py-2">Descripción</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.transaction_id} className="border-t">
                  <td className="px-4 py-2">{tx.transaction_id.slice(0, 8)}...</td>
                  <td className="px-4 py-2">{new Date(tx.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-2">
                    {tx.sender_name} <br />
                    <span className="text-xs text-gray-500">{tx.sender_account_number}</span>
                  </td>
                  <td className="px-4 py-2">
                    {tx.receiver_name} <br />
                    <span className="text-xs text-gray-500">{tx.receiver_account_number}</span>
                  </td>
                  <td className="px-4 py-2">
                    {tx.amount_value.toFixed(2)} {tx.amount_currency}
                  </td>
                  <td className="px-4 py-2">{tx.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
