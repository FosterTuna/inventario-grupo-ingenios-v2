// app/dashboard/page.js
"use client";
import ActivosTable from '../components/ActivosTable';
import { useActivos } from '../context/ActivosContext'; // Importamos el contexto para usar el buscador

export default function DashboardPage() {
  // Obtenemos el estado del buscador y su setter
  const { search, setSearch } = useActivos();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">
        Inventario General Herramientas y Materiales
      </h1>

      {/* --- CAMBIO: RESTAURAMOS EL BUSCADOR AQUÍ --- */}
      <div className="my-6">
        <input
          type="text"
          placeholder="Buscar por nombre de la herramienta o material..."
          className="w-full md:w-1/2 rounded-lg border border-gray-300 px-4 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {/* --- FIN DEL CAMBIO --- */}
      
      <ActivosTable />
    </div>
  );
}