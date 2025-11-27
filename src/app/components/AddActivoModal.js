// src/app/components/AddActivoModal.js
"use client";

import { useState } from 'react';
import axios from 'axios';
import { useActivos } from '../context/ActivosContext';

export default function AddActivoModal({ onClose }) {
  const [nombre, setNombre] = useState('');
  const [sku, setSku] = useState('');
  const [tipo_activo, setTipoActivo] = useState('Herramienta');
  const [stock_total, setStockTotal] = useState(0);
  const [descripcion, setDescripcion] = useState('');
  const [bodega, setBodega] = useState('');
  const [estante, setEstante] = useState('');
  // --- ESTADO PARA LA IMAGEN ---
  const [imagenUrl, setImagenUrl] = useState(''); 
  const [error, setError] = useState('');

  const bodegasFijas = ['Bodega HBB', 'Bodega de la Oficina', 'Bodega de la Clínica'];
  const { fetchActivos } = useActivos();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!nombre || !sku || !stock_total || !estante || bodega === '') { 
      setError('Por favor, selecciona una Bodega y llena todos los demás campos obligatorios.');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const nuevoActivo = {
        nombre, sku, tipo_activo, stock_total: Number(stock_total),
        descripcion, ubicacion: { bodega, estante },
        imagen_url: imagenUrl || null // Enviamos la URL
      };

      await axios.post('http://localhost:5000/api/activos', nuevoActivo, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      await fetchActivos();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear el activo.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Agregar Herramienta / Material</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="max-h-96 overflow-y-auto pr-2">
            {/* ... (SKU y Nombre) ... */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">SKU*</label>
                <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm sm:text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre*</label>
                <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm sm:text-sm" required />
              </div>
            </div>

            {/* --- CAMPO DE URL DE IMAGEN --- */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">URL de la Imagen (Opcional)</label>
                <input
                  type="url"
                  placeholder="https://ejemplo.com/foto.jpg"
                  value={imagenUrl}
                  onChange={(e) => setImagenUrl(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm sm:text-sm"
                />
                {imagenUrl && (
                  <div className="mt-2 flex justify-center rounded-lg border border-gray-200 p-2 bg-gray-50 h-32">
                    <img src={imagenUrl} alt="Vista previa" className="h-full object-contain" 
                         onError={(e) => {e.target.onerror = null; e.target.src="https://via.placeholder.com/150?text=Error+URL"}} />
                  </div>
                )}
            </div>
            {/* ------------------------------ */}

            {/* ... (Resto de campos: Tipo, Stock, Bodega, Estante, Descripción) ... */}
            <div className="grid grid-cols-2 gap-4 mb-4">
               {/* Pega aquí el resto de los inputs que ya tenías (Tipo, Stock, etc) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo*</label>
                    <select value={tipo_activo} onChange={(e) => setTipoActivo(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm sm:text-sm">
                        <option value="Herramienta">Herramienta</option>
                        <option value="Material">Material</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Stock Total*</label>
                    <input type="number" value={stock_total} onChange={(e) => setStockTotal(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm sm:text-sm" required />
                </div>
            </div>
            
             <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Bodega*</label>
                    <select value={bodega} onChange={(e) => setBodega(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm sm:text-sm" required>
                        <option value="" disabled>Selecciona...</option>
                        {bodegasFijas.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Estante*</label>
                    <input type="text" value={estante} onChange={(e) => setEstante(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm sm:text-sm" required />
                </div>
            </div>

             <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm sm:text-sm"></textarea>
            </div>

          </div>

          {error && <p className="my-2 text-center text-sm text-red-600">{error}</p>}

          <div className="mt-6 flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button type="submit" className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">Guardar Activo</button>
          </div>
        </form>
      </div>
    </div>
  );
}