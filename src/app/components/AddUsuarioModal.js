// src/app/components/AddUsuarioModal.js
"use client";

import { useState } from 'react';
import axios from 'axios';

// El modal recibe 'onClose' (para cerrarse) y 'onUserAdded' (para refrescar la tabla)
export default function AddUsuarioModal({ onClose, onUserAdded }) {
  // Estados para el formulario
  const [nombre_completo, setNombreCompleto] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('Trabajador'); // Valor por defecto
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!nombre_completo || !nickname || !password || !rol) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    try {
      // No necesitamos token para crear un usuario (según el backend que hicimos)
      // Pero si tu ruta POST /api/usuarios estuviera protegida, lo necesitarías.

      const nuevoUsuario = {
        nombre_completo,
        'nick-name': nickname,
        password,
        rol
      };

      // Hacemos el POST al backend
      await axios.post('http://localhost:5000/api/usuarios', nuevoUsuario);

      // Si todo sale bien:
      onUserAdded(); // 1. Llama a la función para refrescar la tabla de usuarios
      onClose(); // 2. Cierra el modal

    } catch (err) {
      console.error(err);
      // Mejoramos el mensaje de error para duplicados
      if (err.response?.data?.message && err.response.data.message.includes('E11000')) {
        setError('Ese nick-name ya existe. Por favor, elige otro.');
      } else {
        setError(err.response?.data?.message || 'Error al crear el usuario.');
      }
    }
  };

  return (
    // Fondo oscuro semitransparente
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      {/* Contenedor del Modal */}
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Crear Nuevo Usuario</h2>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">

            <div>
              <label htmlFor="nombre_completo" className="block text-sm font-medium text-gray-700">Nombre Completo*</label>
              <input
                type="text"
                id="nombre_completo"
                value={nombre_completo}
                onChange={(e) => setNombreCompleto(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">Nick-name*</label>
              <input
                type="text"
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña*</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="rol" className="block text-sm font-medium text-gray-700">Rol*</label>
              <select
                id="rol"
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm sm:text-sm"
              >
                <option value="Trabajador">Trabajador</option>
                <option value="Practicante">Practicante</option>
                <option value="Encargado">Encargado</option>
                <option value="Sub-Jefe">Sub-Jefe</option>
                <option value="Jefe">Jefe</option>
              </select>
            </div>

          </div>

          {/* Mensaje de Error */}
          {error && (
            <p className="my-4 text-center text-sm text-red-600">{error}</p>
          )}

          {/* Botones de Acción */}
          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose} // Botón para cerrar
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              Crear Usuario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}