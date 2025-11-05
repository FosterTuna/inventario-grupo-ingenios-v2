// app/dashboard/layout.js
"use client";
import React from 'react'; // Importamos React
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ActivosProvider, useActivos } from '../context/ActivosContext';
import AddActivoModal from '../components/AddActivoModal';
import RegistrarMovimientoModal from '../components/RegistrarMovimientoModal';

// --- COMPONENTE SIDEBAR (BARRA LATERAL) ---
function Sidebar({ onOpenModal }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/');
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-white shadow-lg">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold text-gray-800">Menu</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {/* Vínculo de Inventario General */}
        <a
          href="/dashboard"
          className="mb-2 flex items-center rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100"
          // (Podemos agregar lógica aquí para que se ponga azul si la ruta es '/dashboard')
        >
          <span className="font-medium">Inventario General</span>
        </a>
        
        {/* Botón de Agregar Herramienta */}
        <button 
          onClick={onOpenModal} 
          className="my-4 w-full rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700">
          + Agregar Herramienta / Material
        </button>

        {/* --- CAMBIO AQUÍ --- */}
        {/* Este es el vínculo que actualizamos. 
            Lo cambiamos a una etiqueta <a> simple para asegurarnos de que navegue.
            Asegúrate de que el href sea "/dashboard/usuarios". */}
        <a
          href="/dashboard/usuarios" 
          className="flex items-center rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100"
        >
          <span className="font-medium">Usuarios</span>
        </a>
        {/* --- FIN DEL CAMBIO --- */}

      </div>

      {/* Cerrar Sesión */}
      <div className="border-t p-4">
        <button
          onClick={handleLogout}
          className="w-full rounded-lg px-4 py-2 text-left font-medium text-gray-600 hover:bg-gray-100"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

// --- LAYOUT PRINCIPAL DEL DASHBOARD ---
// (Este componente interno nos permite usar el contexto)
function DashboardLayoutContent({ children }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { isMovModalOpen, closeMovModal, selectedActivo } = useActivos();

  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar onOpenModal={handleOpenAddModal} />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
      
      {isAddModalOpen && <AddActivoModal onClose={handleCloseAddModal} />}
      {isMovModalOpen && <RegistrarMovimientoModal onClose={closeMovModal} activo={selectedActivo} />}
    </div>
  );
}

// (El layout principal solo envuelve todo con el Proveedor)
export default function DashboardLayout({ children }) {
  return (
    <ActivosProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </ActivosProvider>
  );
}