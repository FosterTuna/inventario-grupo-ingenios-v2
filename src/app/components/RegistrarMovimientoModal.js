// src/app/components/RegistrarMovimientoModal.js
"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useActivos } from '../context/ActivosContext';

// El modal ahora recibe 'onClose' y 'activo' (el activo seleccionado)
export default function RegistrarMovimientoModal({ onClose, activo }) {
  const { fetchActivos } = useActivos(); // Para refrescar la tabla

  // Estados para el formulario
  const [usuarios, setUsuarios] = useState([]); // Lista de usuarios para el dropdown
  const [id_usuario_dispone, setUsuarioDispone] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [observaciones, setObservaciones] = useState('');
  const [error, setError] = useState('');

  // --- Carga los usuarios cuando el modal se abre ---
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const token = localStorage.getItem('authToken');
        // Asumimos que /api/usuarios nos da la lista de todos los usuarios
        const response = await axios.get('http://localhost:5000/api/usuarios', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        // Filtramos para obtener solo roles que pueden recibir material
        const usuariosFiltrados = response.data.filter(u => 
          u.rol === 'Trabajador' || u.rol === 'Encargado' || u.rol === 'Practicante'
        );
        setUsuarios(usuariosFiltrados);
      } catch (err) {
        setError('Error al cargar la lista de usuarios.');
      }
    };
    fetchUsuarios();
  }, []); // Se ejecuta solo una vez cuando el modal se monta

  // --- Maneja el envío del formulario ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!id_usuario_dispone || cantidad <= 0) {
      setError('Por favor, selecciona un usuario y una cantidad válida.');
      return;
    }

    if (cantidad > activo.stock_disponible) {
      setError('No puedes registrar una salida mayor al stock disponible.');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const body = {
        id_activo: activo._id,
        id_usuario_dispone: id_usuario_dispone,
        cantidad: Number(cantidad),
        observaciones: observaciones
      };

      // Hacemos el POST al backend
      await axios.post('http://localhost:5000/api/movimientos/salida', body, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      await fetchActivos(); // Refrescamos la tabla de activos
      onClose(); // Cerramos el modal

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al registrar la salida.');
    }
  };

  // Si el activo no se ha cargado, no muestra nada
  if (!activo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Registrar Salida de Activo</h2>

        {/* Información del Activo (solo lectura) */}
        <div className="mb-4 rounded-md bg-gray-50 p-4">
          <p className="font-medium text-gray-900">{activo.nombre}</p>
          <p className="text-sm text-gray-600">SKU: {activo.sku}</p>
          <p className="text-sm text-gray-600">Stock Disponible: {activo.stock_disponible}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="usuario_dispone" className="block text-sm font-medium text-gray-700">Usuario que Recibe (Dispone)*</label>
            <select
              id="usuario_dispone"
              value={id_usuario_dispone}
              onChange={(e) => setUsuarioDispone(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm sm:text-sm"
              required
            >
              <option value="">Seleccionar usuario...</option>
              {usuarios.map(user => (
                <option key={user._id} value={user._id}>
                  {user.nombre_completo} ({user.rol})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700">Cantidad a Retirar*</label>
            <input
              type="number"
              id="cantidad"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm sm:text-sm"
              min="1"
              max={activo.stock_disponible} // No permite poner más del stock
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700">Observaciones</label>
            <textarea
              id="observaciones"
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm sm:text-sm"
            ></textarea>
          </div>

          {error && (
            <p className="my-2 text-center text-sm text-red-600">{error}</p>
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
              Confirmar Salida
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}