'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';


export default function CreateAccountPage() {
  const [ownerId, setOwnerId] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/login');
      return;
    }

    fetch(`/api/user-info?id=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (!data?.isAdmin) router.push('/login');
      });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ owner_id: ownerId }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('Cuenta creada correctamente ✅');
      setOwnerId('');
    } else {
      setMessage(data.error || 'Error al crear la cuenta');
    }
  };

  return (
    <main className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded text-black">
      <h2 className="text-2xl font-bold mb-4">Registrar Cuenta</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          required
          placeholder="Cédula del usuario (owner_id)"
          className="input w-full"
          value={ownerId}
          onChange={e => setOwnerId(e.target.value)}
        />
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          Crear Cuenta
        </button>
        {message && <p className="text-sm text-center text-gray-700">{message}</p>}
      </form>
    </main>
  );
}