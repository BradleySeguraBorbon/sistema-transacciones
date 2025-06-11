'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const PullFundsPage = () => {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [phoneAccount, setPhoneAccount] = useState<string | null>(null);
  const [foreignAccountNumber, setForeignAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (!uid) {
      router.push('/login');
      return;
    }
    setUserId(uid);

    fetch(`/api/my-accounts?cedula=${uid}`)
      .then(res => res.json())
      .then(accounts => {
        const phoneLinked = accounts.find((acc: any) => acc.phone_number !== null);
        setPhoneAccount(phoneLinked?.account_number || null);
      });
  }, [router]);

  const handleSubmit = async () => {
    setMessage(null);
    const monto = parseFloat(amount);
    if (!foreignAccountNumber || isNaN(monto) || monto <= 0 || !phoneAccount) {
      setMessage({ type: 'error', text: 'Todos los campos son obligatorios y deben ser válidos.' });
      return;
    }

    const res = await fetch('/api/request-pull-funds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        account_number: foreignAccountNumber,
        cedula: userId,
        monto,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage({ type: 'success', text: 'Fondos solicitados correctamente.' });
    } else {
      setMessage({ type: 'error', text: data.error || 'Error al solicitar fondos.' });
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl text-black font-bold mb-4 text-center">Solicitud de Fondos</h1>

        <div className="mb-4">
          <label className="block text-black mb-1">Número de cuenta en otro banco (origen)</label>
          <input
            type="text"
            value={foreignAccountNumber}
            onChange={(e) => setForeignAccountNumber(e.target.value)}
            className="w-full border text-black p-2 rounded"
            placeholder="Ej: CR210241..."
          />
        </div>

        <div className="mb-4">
          <label className="block text-black mb-1">Monto a solicitar (₡)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border text-black p-2 rounded"
            placeholder="Monto en colones"
          />
        </div>

        {phoneAccount ? (
          <p className="text-sm text-black mb-4j">
            Recibirás los fondos en la cuenta vinculada a tu número de teléfono: <strong>{phoneAccount}</strong>
          </p>
        ) : (
          <p className="text-sm text-black text-red-600 mb-4">No tienes una cuenta con número de teléfono asignado.</p>
        )}

        {message && (
          <div className={`mb-4 text-center font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {message.text}
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          disabled={!phoneAccount}
        >
          Solicitar Fondos
        </button>

        <button
          onClick={() => router.push('/')}
          className="w-full mt-4 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition"
        >
          Volver al menú
        </button>
      </div>
    </main>
  );
};

export default PullFundsPage;