// app/dashboard/activos/[id]/page.js
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import EditActivoModal from '../../../components/EditActivoModal';
import RegistrarEntradaModal from '../../../components/RegistrarEntradaModal'; // <-- Importado

export default function ActivoDetallePage() {
  const [activo, setActivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEntradaModalOpen, setIsEntradaModalOpen] = useState(false); // <-- Estado para el modal de entrada
  
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  // ... (fetchActivoDetalle se mantiene igual) ...
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
      setError(err.response?.data?.message || 'Error al cargar los detalles del activo.');
      if (err.response && err.response.status === 401) router.push('/');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (id) fetchActivoDetalle();
  }, [id, fetchActivoDetalle]);

  // Función de refresco (para el modal de edición y entrada)
  const handleActivoUpdated = () => {
    setIsEditModalOpen(false);
    setIsEntradaModalOpen(false); // Cierra el modal de entrada también
    fetchActivoDetalle();
  };

  const handleDelete = async () => { /* ... (Lógica de eliminar se mantiene igual) ... */
    if (!window.confirm('¿Estás seguro de que deseas eliminar este activo? Esta acción no se puede deshacer.')) return;
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`http://localhost:5000/api/activos/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
      alert('Activo eliminado correctamente.');
      router.push('/dashboard'); 
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar el activo.');
    }
  };
  // --- FIN DE FUNCIÓN PARA ELIMINAR ---


  if (loading) return <div className="text-gray-900 text-center p-10">Cargando detalles...</div>;
  if (error) return <div className="text-red-600 text-center p-10">{error}</div>;
  if (!activo) return <div className="text-gray-900 text-center p-10">Activo no encontrado.</div>;

  // Determinamos si hay items fuera de bodega para mostrar el botón de devolución
  const itemsFuera = activo.stock_total - activo.stock_disponible;

  return (
    <> 
      <div className="rounded-lg bg-white p-6 shadow-md text-gray-900 max-w-4xl mx-auto">
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <h1 className="text-3xl font-bold">{activo.nombre}</h1>
          <div className="flex gap-4">
            
            {/* BOTÓN EDITAR */}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Editar Activo
            </button>
            
            {/* --- BOTÓN DE DEVOLUCIÓN (ENTRADA) --- */}
            {itemsFuera > 0 && (
                <button
                    onClick={() => setIsEntradaModalOpen(true)}
                    className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                    Registrar Devolución ({itemsFuera})
                </button>
            )}

            {/* BOTÓN ELIMINAR */}
            <button
              onClick={handleDelete}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Eliminar Activo
            </button>
            
            {/* VOLVER AL INVENTARIO */}
            <Link href="/dashboard" className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300">
              ← Volver
            </Link>
          </div>
        </div>

        {/* ... (Resto del contenido de la página se mantiene igual) ... */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {isEditModalOpen && (
        <EditActivoModal activo={activo} onClose={() => setIsEditModalOpen(false)} onActivoUpdated={handleActivoUpdated} />
      )}
      
      {/* --- CAMBIO: Renderizado condicional del modal de entrada --- */}
      {isEntradaModalOpen && (
          <RegistrarEntradaModal
              activo={activo}
              onClose={() => setIsEntradaModalOpen(false)}
              onActivoUpdated={handleActivoUpdated}
          />
      )}
    </>
  );
}