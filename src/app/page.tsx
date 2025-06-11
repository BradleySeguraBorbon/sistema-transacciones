'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const HomePage = () => {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name: string; id: string } | null>(null);

  const navigate = (path: string) => {
    router.push(path);
  };

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/login');
      return;
    }

    fetch(`/api/user-info?id=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data?.isAdmin) setIsAdmin(true);
        setUserInfo({ name: data.name, id: userId });
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    router.push('/login');
  };

  if (!userInfo) return null;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-300">
      <div className="bg-white shadow-lg rounded-lg p-10 max-w-md w-full space-y-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800">Sistema de Transferencias</h1>
        {userInfo && (
          <div className="text-black text-md">
            <p>Bienvenido, <strong>{userInfo.name}</strong></p>
            <p className="text-xs">Cédula: {userInfo.id}</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={() => navigate('/transfer')}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Transferencia por Cuenta
          </button>

          <button
            onClick={() => navigate('/sinpe')}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
          >
            Transferencia SINPE
          </button>

          <button
            onClick={() => navigate('/sinpe-register')}
            className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition"
          >
            Registrar en SINPE
          </button>

          <button
            onClick={() => navigate('/balances')}
            className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition"
          >
            Ver Saldos de Cuentas
          </button>

          <button
            onClick={() => navigate('/request-pull-funds')}
            className="w-full bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700 transition"
          >
            Solicitar Fondos de Otro Banco
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => navigate('/admin/create-user')}
                className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 transition"
              >
                Registrar Usuario
              </button>

              <button
                onClick={() => navigate('/admin/create-account')}
                className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 transition"
              >
                Registrar Cuenta
              </button>

              <button
                onClick={() => navigate('/transactions')}
                className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900 transition"
              >
                Ver Transacciones
              </button>
            </>
          )}

          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
          >
            Cerrar Sesión
          </button>

        </div>
      </div>
    </main>
  );
};

export default HomePage;
