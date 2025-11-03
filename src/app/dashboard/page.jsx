// app/dashboard/page.js
"use client";
import ActivosTable from '../components/ActivosTable';

// La página ya no recibe props, es totalmente limpia
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">
        Inventario General Herramientas y Materiales
      </h1>
      <div className="my-6 flex items-center">
        <input
          type="text"
          placeholder="Buscar por nombre de la herramienta o material..."
          className="w-1/2 rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
        />
      </div>
      <ActivosTable />
    </div>
  );
}