// app/dashboard/activos/[id]/page.js
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

export default function ActivoDetallePage() {
  const [activo, setActivo] = useState(null); // Estado para guardar el activo
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const params = useParams(); // Hook para leer los parámetros de la URL
  const router = useRouter();
  const { id } = params; // Obtenemos el ID del activo desde la URL

  // useEffect para cargar los datos del activo cuando la página carga
  useEffect(() => {
    if (id) { // Solo ejecuta si el ID está disponible
      const fetchActivoDetalle = async () => {
        try {
          const token = localStorage.getItem('authToken');
          if (!token) {
            router.push('/');
            return;
          }

          // Hacemos un GET al endpoint del backend para un solo activo
          // (Este endpoint aún no lo hemos creado en el backend)
          const response = await axios.get(`http://localhost:5000/api/activos/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          setActivo(response.data); // Guardamos el activo encontrado
          setLoading(false);
        } catch (err) {
          console.error('Error al cargar detalle:', err);
          setError('Error al cargar los detalles del activo.');
          setLoading(false);
        }
      };

      fetchActivoDetalle();
    }
  }, [id, router]); // Se vuelve a ejecutar si el ID cambia

  // --- Renderizado ---
  if (loading) {
    return <div className="text-gray-900">Cargando detalles...</div>;
  }
  if (error) {
    return <div className="text-red-600">{error}</div>;
  }
  if (!activo) {
    return <div className="text-gray-900">Activo no encontrado.</div>;
  }

  // Una vez que tenemos los datos, los mostramos
  return (
    <div className="rounded-lg bg-white p-6 shadow-md text-gray-900">
      {/* Encabezado con botón de volver */}
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <h1 className="text-3xl font-bold">{activo.nombre}</h1>
        <Link href="/dashboard" className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300">
          ← Volver al Inventario
        </Link>
      </div>

      {/* Layout de dos columnas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna Izquierda: Imagen y Detalles Principales */}
        <div className="md:col-span-1 space-y-4">
          <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100">
            {/* Aquí iría la imagen */}
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

        {/* Columna Derecha: Descripción, Stock, Especificaciones */}
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
            {/* (Aquí mapearíamos las especificaciones si existen) */}
            <p><strong>Marca:</strong> {activo.especificaciones?.marca || 'N/A'}</p>
            <p><strong>Color:</strong> {activo.especificaciones?.color || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}