'use client';

import { useState } from 'react';

const SinpeRegisterPage = () => {
  const [form, setForm] = useState({ phone_number: '', client_name: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/register-sinpe-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) setMessage('Registro exitoso ✅');
      else setMessage(`Error: ${data.error}`);
    } catch {
      setMessage('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md max-w-sm w-full space-y-4">
        <h2 className="text-xl font-bold text-center text-black">Registro en SINPE Móvil</h2>

        <input
          type="text"
          name="phone_number"
          placeholder="Número de teléfono"
          value={form.phone_number}
          onChange={handleChange}
          className="input w-full text-black"
          required
        />

        <input
          type="text"
          name="client_name"
          placeholder="Nombre completo"
          value={form.client_name}
          onChange={handleChange}
          className="input w-full text-black"
          required
        />

        <button
          type="submit"
          className="w-full bg-green-600 py-2 rounded hover:bg-green-700"
          disabled={loading}
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>

        {message && <p className="text-center text-sm text-gray-700">{message}</p>}
      </form>
    </main>
  );
};

export default SinpeRegisterPage;
