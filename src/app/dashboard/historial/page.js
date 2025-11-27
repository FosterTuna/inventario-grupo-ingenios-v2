// src/app/dashboard/historial/page.js
"use client";

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HistorialPage() {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const fetchHistorial = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/movimientos/historial', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setHistorial(response.data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar el historial:', err);
      setError('Error al cargar el historial de movimientos.');
      if (err.response && err.response.status === 401) {
        router.push('/');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchHistorial();
  }, [fetchHistorial]);

  const getStatusStyle = (tipo) => {
    switch (tipo) {
      case 'Salida Uso':
      case 'Salida Renta':
        return 'bg-red-100 text-red-800';
      case 'Devolución':
        return 'bg-green-100 text-green-800';
      case 'Entrada Inicial':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="text-gray-900 text-center p-10">Cargando historial de movimientos...</div>;
  if (error) return <div className="text-red-600 text-center p-10">{error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Historial Completo de Movimientos</h1>
      
      <Link href="/dashboard" className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300 mb-6 inline-block">
        ← Volver al Inventario
      </Link>

      <div className="rounded-lg bg-white shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-gray-900">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Activo (SKU)</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Cantidad</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Dispone (Recibe)</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Adjunta (Entrega)</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Observaciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {historial.length > 0 ? (
              historial.map((mov, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(mov.fecha).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${getStatusStyle(mov.tipo)}`}>
                      {mov.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {mov.activo_nombre} ({mov.activo_sku})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                    {mov.tipo.includes('Salida') ? '-' : '+'}{mov.cantidad}
                  </td>
                  
                  {/* --- CAMBIO AQUÍ: Usamos el nuevo campo formateado --- */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {mov.dispone_nombre_completo || 'N/A'} 
                  </td>
                  {/* --- FIN DEL CAMBIO --- */}

                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {mov.adjunta_nombre} ({mov.adjunta_rol})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {mov.observaciones}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-sm">No se encontró historial de movimientos.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}