// src/app/components/EditUsuarioModal.js
"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';

// Recibe 'onClose', 'onUserUpdated' y el 'user' a editar
export default function EditUsuarioModal({ onClose, onUserUpdated, user }) {
  // Estados para el formulario, pre-llenados con los datos del usuario
  const [nombre_completo, setNombreCompleto] = useState(user.nombre_completo);
  const [nickname, setNickname] = useState(user['nick-name']);
  const [rol, setRol] = useState(user.rol);
  const [activo, setActivo] = useState(user.activo);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!nombre_completo || !nickname || !rol) {
      setError('Los campos Nombre, Nick-name y Rol son obligatorios.');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const updatedData = {
        nombre_completo,
        'nick-name': nickname,
        rol,
        activo
      };

      // Hacemos el PUT al backend con el ID del usuario
      await axios.put(`http://localhost:5000/api/usuarios/${user._id}`, updatedData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      onUserUpdated(); // Refresca la tabla
      onClose(); // Cierra el modal

    } catch (err) {
      console.error(err);
      // Mensaje de error personalizado para nick-name duplicado
      if (err.response?.data?.message && err.response.data.message.includes('nick-name ya está en uso')) {
        setError('Ese nick-name ya existe. Por favor, elige otro.');
      } else {
        setError(err.response?.data?.message || 'Error al actualizar el usuario.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Editar Usuario</h2>

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

            {/* No permitimos editar la contraseña desde aquí */}

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

            <div>
              <label htmlFor="activo" className="block text-sm font-medium text-gray-700">Estado*</label>
              <select
                id="activo"
                value={activo}
                onChange={(e) => setActivo(e.target.value === 'true')} // Convertir string a boolean
                className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm sm:text-sm"
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>

          </div>

          {error && (
            <p className="my-4 text-center text-sm text-red-600">{error}</p>
          )}

          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}