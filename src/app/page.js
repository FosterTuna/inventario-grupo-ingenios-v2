// app/page.js
"use client";

import { useState } from 'react';
import axios from 'axios'; // <-- Cambio: Importamos axios

export default function LoginPage() {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('');
  const [error, setError] = useState(''); // <-- Cambio: Estado para mensajes de error

  // --- Función actualizada para enviar datos al backend ---
  const handleSubmit = async (event) => { // <-- Cambio: Hacemos la función async
    event.preventDefault();
    setError(''); // Limpiamos errores previos

    try {
      // Hacemos la petición POST al backend
      const response = await axios.post('http://localhost:5000/api/usuarios/login', {
        'nick-name': nickname, // Asegúrate de que coincida con el backend
        password: password,
        // Nota: El rol no se envía usualmente en el login, el backend lo sabe
      });

      // Si el login es exitoso
      console.log('Login exitoso:', response.data);
      const token = response.data.token;

      // --- PASO FUTURO: Guardar el token y redirigir ---
      // localStorage.setItem('authToken', token);
      // window.location.href = '/dashboard'; // O usar el router de Next.js

      alert('¡Inicio de sesión exitoso! Revisa la consola para ver el token.'); // Mensaje temporal

    } catch (err) {
      // Si hay un error (ej. credenciales incorrectas)
      console.error('Error en el login:', err.response?.data?.message || 'Error desconocido');
      setError(err.response?.data?.message || 'Error al iniciar sesión. Inténtalo de nuevo.'); // <-- Cambio: Mostramos error
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">

        {/* ... (Las partes de h1, h2, p se mantienen igual) ... */}
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
          {/* ... (El select de Rol se mantiene igual) ... */}
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

          {/* ... (El input de nick-name se mantiene igual) ... */}
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

          {/* ... (El input de password se mantiene igual) ... */}
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


          {/* Mostramos el mensaje de error si existe */}
          {error && (
            <p className="mb-4 text-center text-sm text-red-600">{error}</p> // <-- Cambio
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