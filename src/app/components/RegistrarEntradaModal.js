// src/app/components/RegistrarEntradaModal.js
"use client";

import { useState } from 'react';
import axios from 'axios';
import { useActivos } from '../context/ActivosContext'; // <-- Importamos el contexto

// Recibe 'onClose' y el 'activo' a devolver, y 'onActivoUpdated' para refrescar la página de detalles
export default function RegistrarEntradaModal({ onClose, activo, onActivoUpdated }) {
  // Obtenemos la función fetchActivos del contexto para refrescar la tabla principal
  const { fetchActivos } = useActivos(); 
  
  const [cantidad, setCantidad] = useState(1);
  const [estado_devolucion, setEstadoDevolucion] = useState('Funcional');
  const [observaciones, setObservaciones] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (cantidad <= 0) {
      setError('La cantidad debe ser mayor a cero.');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const body = {
        id_activo: activo._id,
        cantidad: Number(cantidad),
        estado_devolucion,
        observaciones
      };

      // 1. Hacemos el POST al endpoint de ENTRADA
      await axios.post('http://localhost:5000/api/movimientos/entrada', body, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // 2. Ejecutamos la función de refresco de la página de detalles
      if (onActivoUpdated) {
          onActivoUpdated();
      }
      
      // 3. Forzamos el refresco de la tabla principal del dashboard
      await fetchActivos(); 
      
      onClose(); // 4. Cerramos el modal

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al registrar la devolución.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Registrar Devolución (Entrada)</h2>
        
        <div className="mb-4 rounded-md bg-gray-50 p-4">
          <p className="font-medium text-gray-900">{activo.nombre}</p>
          {/* Calculamos el stock fuera de la bodega */}
          <p className="text-sm text-gray-600">Stock Disponible Fuera: {activo.stock_total - activo.stock_disponible}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700">Cantidad Devuelta*</label>
            <input
              type="number"
              id="cantidad"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm sm:text-sm"
              min="1"
              max={activo.stock_total - activo.stock_disponible}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="estado_devolucion" className="block text-sm font-medium text-gray-700">Estado de la Devolución*</label>
            <select
              id="estado_devolucion"
              value={estado_devolucion}
              onChange={(e) => setEstadoDevolucion(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm sm:text-sm"
            >
              <option value="Funcional">Funcional (Devolución normal)</option>
              <option value="Mantenimiento">Requiere Mantenimiento</option>
              <option value="Baja">Dañado (Posible baja)</option>
            </select>
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

          {error && (<p className="my-2 text-center text-sm text-red-600">{error}</p>)}

          <div className="mt-6 flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button type="submit" className="rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700">Confirmar Entrada</button>
          </div>
        </form>
      </div>
    </div>
  );
}