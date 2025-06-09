'use client'

import React from 'react';
import { useRouter } from 'next/navigation';

const HomePage = () => {
  const router = useRouter();

  const navigate = (path: string) => {
    router.push(path);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-300">
      <div className="bg-white shadow-lg rounded-lg p-10 max-w-md w-full space-y-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800">Sistema de Transferencias</h1>
        <p className="text-gray-600">Selecciona una acción para comenzar</p>

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
            onClick={() => navigate('/transactions')}
            className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900 transition"
          >
            Ver Transacciones
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

        </div>
      </div>
    </main>
  );
};

export default HomePage;
