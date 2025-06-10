'use client'

import React, { useState } from 'react';

const SinpeTransferForm = () => {
  const [form, setForm] = useState({
    senderPhone: '',
    receiverPhone: '',
    amount: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const payload = {
      transaction_id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      sender: {
        phone_number: form.senderPhone,
      },
      receiver: {
        phone_number: form.receiverPhone,
      },
      amount: {
        value: parseFloat(form.amount),
        currency: 'CRC', // fijo por defecto
      },
      description: form.description,
      hmac_md5: '', // omitido, sin cálculo
    };

    try {
      const res = await fetch('/api/send-sinpe-movil-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) setMessage('Transferencia SINPE exitosa ✅');
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
      <h2 className="text-2xl font-semibold text-gray-700">Transferencia SINPE</h2>

      <div className="grid grid-cols-2 gap-4">
        <input
          name="senderPhone"
          placeholder="Teléfono Remitente"
          value={form.senderPhone}
          onChange={handleChange}
          className="input col-span-2"
        />
        <input
          name="receiverPhone"
          placeholder="Teléfono Receptor"
          value={form.receiverPhone}
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
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
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

export default SinpeTransferForm;
