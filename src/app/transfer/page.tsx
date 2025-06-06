'use client'

import React, { useState } from 'react';

function extractBankCode(account: string) {
  const match = account.match(/^CR21(\d{4})/);
  return match ? match[1] : '';
}

const TransferForm = () => {
  const [form, setForm] = useState({
    senderAccount: '',
    receiverAccount: '',
    amount: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // If the user is typing the receiver account, derive its bank code
    if (name === 'receiverAccount') {
      const bankCode = extractBankCode(value);
      setForm(prev => ({ ...prev, receiverAccount: value}));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const payload = {
      transaction_id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      sender: {
        account_number: form.senderAccount,
      },
      receiver: {
        account_number: form.receiverAccount,
      },
      amount: {
        value: parseFloat(form.amount),
        currency: 'CRC', // Fijo por defecto
      },
      description: form.description,
      hmac_md5: '', // Vacío por ahora, si se requiere puedes generarlo luego
    };

    try {
      const res = await fetch('/api/send-sinpe-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) setMessage('Transferencia exitosa ✅');
      else setMessage(`Error: ${data.error}`);
    } catch (err) {
      setMessage('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto bg-white shadow-md rounded-lg p-6 space-y-4 mt-10 text-black"
    >
      <h2 className="text-2xl font-semibold text-gray-700">Nueva Transferencia</h2>

      <div className="grid grid-cols-2 gap-4">
        <input
          name="senderAccount"
          placeholder="Cuenta Remitente"
          value={form.senderAccount}
          onChange={handleChange}
          className="input col-span-2"
        />
        <input
          name="receiverAccount"
          placeholder="Cuenta Receptor"
          value={form.receiverAccount}
          onChange={handleChange}
          className="input col-span-2"
        />
        <input
          name="amount"
          type="number"
          placeholder="Monto"
          value={form.amount}
          onChange={handleChange}
          className="input col-span-2"
        />
        <input
          name="description"
          placeholder="Descripción"
          value={form.description}
          onChange={handleChange}
          className="input col-span-2"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Enviando...' : 'Enviar Transferencia'}
      </button>

      {message && (
        <p className="text-center text-sm text-gray-700 mt-2">{message}</p>
      )}
    </form>
  );
};

export default TransferForm;
