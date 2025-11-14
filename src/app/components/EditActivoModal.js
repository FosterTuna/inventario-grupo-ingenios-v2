// src/app/components/EditActivoModal.js
"use client";

import { useState } from 'react';
import axios from 'axios';
// <-- CAMBIO: Ya no importamos 'useActivos' porque no lo necesitamos aquí

// Recibe 'onClose', 'onActivoUpdated' (la función para refrescar) y el 'activo'
export default function EditActivoModal({ onClose, onActivoUpdated, activo }) {
  
  // ... (Los estados [nombre, sku, etc.] se mantienen igual) ...
  const [nombre, setNombre] = useState(activo.nombre);
  const [sku, setSku] = useState(activo.sku);
  const [tipo_activo, setTipoActivo] = useState(activo.tipo_activo);
  const [stock_total, setStockTotal] = useState(activo.stock_total);
  const [descripcion, setDescripcion] = useState(activo.descripcion || '');
  const [bodega, setBodega] = useState(activo.ubicacion?.bodega || '');
  const [estante, setEstante] = useState(activo.ubicacion?.estante || '');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!nombre || !sku || !stock_total || !bodega || !estante) {
      setError('Por favor, llena todos los campos obligatorios.');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No estás autenticado.');
        return;
      }

      const updatedData = {
        nombre,
        sku,
        tipo_activo,
        stock_total: Number(stock_total),
        descripcion,
        ubicacion: { bodega, estante }
      };

      await axios.put(`http://localhost:5000/api/activos/${activo._id}`, updatedData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // --- CAMBIO CLAVE AQUÍ ---
      onActivoUpdated(); // 1. Llama a la función de refresco que nos pasó la página
      onClose();         // 2. Cierra el modal
      // --- FIN DEL CAMBIO ---

    } catch (err) {
      console.error(err);
      if (err.response?.data?.message && err.response.data.message.includes('SKU ya está en uso')) {
        setError('Ese SKU ya existe. Por favor, usa un identificador diferente.');
      } else {
        setError(err.response?.data?.message || 'Error al actualizar el activo.');
      }
    }
  };

  return (
    // El resto del JSX del modal (el formulario) es exactamente el mismo
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Editar Activo</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="max-h-96 overflow-y-auto pr-2">
            {/* ... (Campos del formulario: SKU, Nombre, etc. se mantienen igual) ... */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="sku" className="block text-sm font-medium text-gray-700">SKU*</label>
                <input
                  type="text"
                  id="sku"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre del Activo*</label>
                <input
                  type="text"
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm sm:text-sm"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="tipo_activo" className="block text-sm font-medium text-gray-700">Tipo*</label>
                <select
                  id="tipo_activo"
                  value={tipo_activo}
                  onChange={(e) => setTipoActivo(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm sm:text-sm"
                >
                  <option value="Herramienta">Herramienta</option>
                  <option value="Material">Material</option>
                </select>
              </div>
              <div>
                <label htmlFor="stock_total" className="block text-sm font-medium text-gray-700">Stock Total*</label>
                <input
                  type="number"
                  id="stock_total"
                  value={stock_total}
                  onChange={(e) => setStockTotal(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm sm:text-sm"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="bodega" className="block text-sm font-medium text-gray-700">Bodega*</label>
                <input
                  type="text"
                  id="bodega"
                  value={bodega}
                  onChange={(e) => setBodega(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="estante" className="block text-sm font-medium text-gray-700">Estante*</label>
                <input
                  type="text"
                  id="estante"
                  value={estante}
                  onChange={(e) => setEstante(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm sm:text-sm"
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción</label>
              <textarea
                id="descripcion"
                rows={3}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm sm:text-sm"
              ></textarea>
            </div>
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
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}