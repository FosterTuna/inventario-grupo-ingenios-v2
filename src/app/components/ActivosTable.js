// src/app/components/ActivosTable.js
"use client";
import { useActivos } from '../context/ActivosContext'; // <-- CAMBIO: Importamos el hook

// La tabla ya NO recibe 'onOpenMovimientoModal' como prop
export default function ActivosTable() {
  // Obtenemos todo lo que necesitamos del contexto
  const { activos, loading, error, openMovModal } = useActivos(); // <-- CAMBIO

  // ... (if loading, if error... se mantiene igual) ...
  if (loading) {
    return <div className="rounded-lg bg-white p-6 shadow-md text-gray-900">Cargando activos...</div>;
  }
  if (error) {
    return <div className="rounded-lg bg-white p-6 shadow-md text-red-600">{error}</div>;
  }

  return (
    <div className="rounded-lg bg-white shadow-md overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-gray-900">
        {/* ... (thead se mantiene igual) ... */}
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">SKU</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nombre del Activo</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tipo</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Stock Disponible</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Estado</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Ubicación</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {activos && activos.length > 0 ? (
            activos.map((activo) => (
              <tr key={activo._id}>
                {/* ... (celdas de datos se mantienen igual) ... */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{activo.sku}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{activo.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{activo.tipo_activo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{activo.stock_disponible}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    activo.estado_actual === 'Disponible' ? 'bg-green-100 text-green-800' :
                    activo.estado_actual === 'En Uso' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {activo.estado_actual}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{activo.ubicacion?.bodega} / {activo.ubicacion?.estante}</td>
                
                {/* --- CAMBIO EN ACCIONES --- */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <a href="#" className="text-blue-600 hover:text-blue-900">Ver Detalles</a>
                  <button
                    onClick={() => openMovModal(activo)} // <-- CAMBIO: Llama a la función del contexto
                    className="ml-4 text-blue-600 hover:text-blue-900"
                  >
                    Registrar Mov.
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="px-6 py-4 text-center text-sm">No se encontraron activos.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}