// app/dashboard/layout.js
"use client";
import React from 'react'; // Importamos React
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ActivosProvider, useActivos } from '../context/ActivosContext'; // Importamos el Contexto
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
        >
          <span className="font-medium">Inventario General</span>
        </a>
        
        {/* Botón de Agregar Herramienta */}
        <button 
          onClick={onOpenModal} 
          className="my-4 w-full rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700">
          + Agregar Herramienta / Material
        </button>

        {/* Vínculo de Usuarios */}
        <a
          href="/dashboard/usuarios" 
          className="flex items-center rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100"
        >
          <span className="font-medium">Usuarios</span>
        </a>
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

// --- LAYOUT INTERNO (para poder usar el contexto) ---
function DashboardLayoutContent({ children }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Obtenemos los datos del modal de movimiento DESDE EL CONTEXTO
  const { isMovModalOpen, closeMovModal, selectedActivo } = useActivos();

  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar onOpenModal={handleOpenAddModal} />
      <main className="flex-1 overflow-y-auto p-8">
        {children} {/* Aquí se renderiza la página (Dashboard o Usuarios) */}
      </main>
      
      {/* Los modales viven aquí, controlados por el estado del layout y el contexto */}
      {isAddModalOpen && <AddActivoModal onClose={handleCloseAddModal} />}
      {isMovModalOpen && <RegistrarMovimientoModal onClose={closeMovModal} activo={selectedActivo} />}
    </div>
  );
}

// --- LAYOUT PRINCIPAL (El que exportamos) ---
// Este componente envuelve todo con el Proveedor de Contexto
export default function DashboardLayout({ children }) {
  return (
    <ActivosProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </ActivosProvider>
  );
}