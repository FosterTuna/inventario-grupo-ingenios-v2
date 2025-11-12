// app/page.js
"use client";

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('');
  const [error, setError] = useState('');
  
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      // Hacemos la petición POST al backend
      const response = await axios.post('http://localhost:5000/api/usuarios/login', {
        'nick-name': nickname,
        password: password,
        rol: rol // <-- CAMBIO CLAVE: Ahora sí enviamos el rol
      });

      // Si el login es exitoso
      console.log('Login exitoso:', response.data);
      const token = response.data.token;

      // 1. Guardar el token
      localStorage.setItem('authToken', token);

      // 2. Redirigir al dashboard
      router.push('/dashboard');

    } catch (err) {
      console.error('Error en el login:', err.response?.data?.message || 'Error desconocido');
      setError(err.response?.data?.message || 'Error al iniciar sesión. Inténtalo de nuevo.');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        
        <h1 className="text-center text-2xl font-bold text-gray-900">
          Bienvenido al Sistema de Inventario
        </h1>
        <h2 className="mb-6 text-center text-3xl font-bold text-blue-600">
          Grupo Ingenios
        </h2>
        <p className="mb-6 text-center text-gray-600">
          Ingresa tus datos para acceder
        </p>

        <form onSubmit={handleSubmit}>
          {/* ... (El resto del formulario se mantiene igual) ... */}
          <div className="mb-4">
            <label htmlFor="rol" className="mb-2 block font-semibold text-gray-700">
              Seleccionar Rol
            </label>
            <select
              id="rol"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              required
            >
              <option value="">Selecciona tu rol</option>
              <option value="Jefe">Jefe</option>
              <option value="Sub-Jefe">Sub-Jefe</option>
              <option value="Encargado">Encargado</option>
              <option value="Practicante">Practicante</option>
              <option value="Trabajador">Trabajador</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="nickname" className="mb-2 block font-semibold text-gray-700">
              nick-name
            </label>
            <input
              type="text"
              id="nickname"
              placeholder="tu_nickname"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="mb-2 block font-semibold text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="mb-4 text-center text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2 font-bold text-white transition-colors hover:bg-blue-700"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </main>
  );
}