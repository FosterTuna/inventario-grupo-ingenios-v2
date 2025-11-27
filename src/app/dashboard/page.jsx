// app/dashboard/page.js
"use client";
import ActivosTable from '../components/ActivosTable';
import { useActivos } from '../context/ActivosContext';
import Link from 'next/link'; // <-- CAMBIO: Importamos Link

export default function DashboardPage() {
  const { search, setSearch } = useActivos();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">
        Inventario General Herramientas y Materiales
      </h1>

      {/* --- CAMBIOS AQUÍ: Buscador y Botón de Historial en la misma fila --- */}
      <div className="my-6 flex items-center gap-4">
        <input
          type="text"
          placeholder="Buscar por nombre de la herramienta o material..."
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        
        {/* BOTÓN DE HISTORIAL (Nuevo) */}
        <Link 
          href="/dashboard/historial" 
          className="rounded-lg bg-yellow-600 px-4 py-2 font-bold text-white shadow-sm hover:bg-yellow-700 whitespace-nowrap"
        >
          Ver Historial
        </Link>
      </div>
      {/* --- FIN DE CAMBIOS --- */}
      
      <ActivosTable />
    </div>
  );
}