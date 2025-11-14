// app/dashboard/activos/[id]/page.js
"use client";

import { useEffect, useState, useCallback } from 'react'; // <-- CAMBIO: Importamos 'useCallback'
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import EditActivoModal from '../../../components/EditActivoModal'; // <-- CAMBIO: Importamos el nuevo modal

export default function ActivoDetallePage() {
  const [activo, setActivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // --- CAMBIO: Estado para el modal ---
  const [isModalOpen, setIsModalOpen] = useState(false); 
  
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  // --- CAMBIO: Convertimos la carga de datos en una función 'useCallback' ---
  // Esto nos permite llamarla de nuevo para refrescar los datos después de editar.
  const fetchActivoDetalle = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/');
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/activos/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setActivo(response.data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar detalle:', err);
      setError('Error al cargar los detalles del activo.');
      if (err.response && err.response.status === 401) {
        router.push('/');
      }
    } finally {
      setLoading(false);
    }
  }, [id, router]); // La función depende de 'id' y 'router'

  // useEffect ahora solo llama a la función
  useEffect(() => {
    if (id) {
      fetchActivoDetalle();
    }
  }, [id, fetchActivoDetalle]); // <-- CAMBIO: Usamos la función del callback

  // --- CAMBIO: Función para manejar el cierre del modal y refrescar ---
  const handleActivoUpdated = () => {
    setIsModalOpen(false); // Cierra el modal
    fetchActivoDetalle();  // Vuelve a cargar los datos del activo
  };

  // --- Renderizado ---
  if (loading) {
    return <div className="text-gray-900 text-center p-10">Cargando detalles...</div>;
  }
  if (error) {
    return <div className="text-red-600 text-center p-10">{error}</div>;
  }
  if (!activo) {
    return <div className="text-gray-900 text-center p-10">Activo no encontrado.</div>;
  }

  return (
    // Usamos React.Fragment (</>) para poder tener el modal al mismo nivel
    <> 
      <div className="rounded-lg bg-white p-6 shadow-md text-gray-900 max-w-4xl mx-auto">
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <h1 className="text-3xl font-bold">{activo.nombre}</h1>
          <div className="flex gap-4">
            {/* --- CAMBIO: El botón "Editar" ahora abre el modal --- */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Editar Activo
            </button>
            <Link href="/dashboard" className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300">
              ← Volver al Inventario
            </Link>
          </div>
        </div>

        {/* ... (El resto del layout de dos columnas se mantiene igual) ... */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Columna Izquierda */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100">
              <span className="text-gray-500">Imagen del activo</span>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold mb-3">Detalles Principales</h3>
              <div className="space-y-2">
                <p><strong>SKU:</strong> {activo.sku}</p>
                <p><strong>Tipo:</strong> {activo.tipo_activo}</p>
                <p><strong>Estado:</strong> {activo.estado_actual}</p>
                <p><strong>Ubicación:</strong> {activo.ubicacion?.bodega} / {activo.ubicacion?.estante}</p>
              </div>
            </div>
          </div>

          {/* Columna Derecha */}
          <div className="md:col-span-2 space-y-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold mb-2">Descripción</h3>
              <p>{activo.descripcion || 'No hay descripción disponible.'}</p>
            </div>
            <div className="flex gap-4">
              <div className="flex-1 rounded-lg border border-gray-200 p-4 text-center">
                <p className="text-sm text-gray-500">Stock Total</p>
                <p className="text-3xl font-bold">{activo.stock_total}</p>
              </div>
              <div className="flex-1 rounded-lg border border-gray-200 p-4 text-center">
                <p className="text-sm text-gray-500">Stock Disponible</p>
                <p className="text-3xl font-bold">{activo.stock_disponible}</p>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold mb-3">Especificaciones</h3>
              <p><strong>Marca:</strong> {activo.especificaciones?.marca || 'N/A'}</p>
              <p><strong>Color:</strong> {activo.especificaciones?.color || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- CAMBIO: Renderizado condicional del modal --- */}
      {isModalOpen && (
        <EditActivoModal
          activo={activo}
          onClose={() => setIsModalOpen(false)}
          onActivoUpdated={handleActivoUpdated}
        />
      )}
    </>
  );
}