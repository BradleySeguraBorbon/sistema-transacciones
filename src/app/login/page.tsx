'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [form, setForm] = useState({ id: '', password: '' });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('userId', data.user.id); // Guardar cédula
        router.push('/'); // Redirigir a la vista principal
      } else {
        setError(data.error || 'Error de inicio de sesión');
      }
    } catch {
      setError('Error de conexión');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md max-w-sm w-full space-y-4"
      >
        <h2 className="text-xl font-bold text-center text-black">Iniciar Sesión</h2>

        <input
          type="text"
          name="id"
          placeholder="Cédula"
          value={form.id}
          onChange={handleChange}
          className="input w-full text-black"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          className="input w-full text-black"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 py-2 text-white rounded hover:bg-blue-700"
        >
          Iniciar Sesión
        </button>

        {error && <p className="text-center text-sm text-red-600">{error}</p>}
      </form>
    </main>
  );
}
