'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateUserPage() {
    const [form, setForm] = useState({ id: '', name: '', phone: '', password: '', isAdmin: false });
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
        const data = await res.json();
        if (res.ok) {
            setMessage('Usuario creado exitosamente ✅');
            setForm({ id: '', name: '', phone: '', password: '', isAdmin: false });
        } else {
            setMessage(data.error || 'Error al crear el usuario');
        }
    };

    return (
        <main className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded text-black">
            <h2 className="text-2xl font-bold mb-4">Registrar Usuario</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input name="id" required placeholder="Cédula" className="input w-full" value={form.id} onChange={handleChange} />
                <input name="name" required placeholder="Nombre completo" className="input w-full" value={form.name} onChange={handleChange} />
                <input name="phone" required placeholder="Teléfono" className="input w-full" value={form.phone} onChange={handleChange} />
                <input name="password" required type="password" placeholder="Contraseña" className="input w-full" value={form.password} onChange={handleChange} />
                <label className="flex items-center space-x-2">
                    <input type="checkbox" name="isAdmin" checked={form.isAdmin} onChange={handleChange} />
                    <span>Es administrador</span>
                </label>
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                    Crear Usuario
                </button>
                {message && <p className="text-sm text-center text-gray-700">{message}</p>}
            </form>
        </main>
    );
}