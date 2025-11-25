// app/dashboard/layout.js
"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ActivosProvider, useActivos } from '../context/ActivosContext';
import AddActivoModal from '../components/AddActivoModal';
import RegistrarMovimientoModal from '../components/RegistrarMovimientoModal';

// --- COMPONENTE SIDEBAR (MODIFICADO) ---
function Sidebar({ onOpenModal }) {
  const router = useRouter();
  const { 
    estado, setEstado,
    tipo, setTipo,
    bodega, setBodega,
    estante, setEstante
  } = useActivos();

  // --- LISTA DE BODEGAS FIJAS ---
  const bodegasFijas = [
    'Bodega HBB',
    'Bodega de la Oficina',
    'Bodega de la Clínica'
  ];
  // --- FIN DE LISTA ---

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
        {/* Vínculos y Botón Agregar... (sin cambios) */}
        <a href="/dashboard" className="mb-2 flex items-center rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100">
          <span className="font-medium">Inventario General</span>
        </a>
        <a href="/dashboard/usuarios" className="flex items-center rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100">
          <span className="font-medium">Usuarios</span>
        </a>
        
        <button onClick={onOpenModal} className="my-4 w-full rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700">
          + Agregar Herramienta / Material
        </button>

        {/* --- FILTROS EN LA BARRA LATERAL --- */}
        <div className="mt-6 border-t pt-4">
          <h3 className="mb-3 px-4 text-xs font-semibold uppercase text-gray-500">Filtros de Inventario</h3>
          
          <div className="space-y-3">
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900">
              <option value="">Todos los Tipos</option>
              <option value="Herramienta">Herramienta</option>
              <option value="Material">Material</option>
            </select>
            
            <select value={estado} onChange={(e) => setEstado(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900">
              <option value="">Todos los Estados</option>
              <option value="Disponible">Disponible</option>
              <option value="En Uso">En Uso</option>
              <option value="Mantenimiento">Mantenimiento</option>
            </select>
            
            {/* --- SELECT DE BODEGAS (ACTUALIZADO) --- */}
            <select 
              value={bodega} 
              onChange={(e) => setBodega(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
            >
              <option value="">Todas las Bodegas</option> {/* Opción de filtro */}
              {bodegasFijas.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            {/* --- FIN SELECT DE BODEGAS --- */}

            <input
              type="text"
              placeholder="Buscar por estante..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
              value={estante}
              onChange={(e) => setEstante(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="border-t p-4">
        <button onClick={handleLogout} className="w-full rounded-lg px-4 py-2 text-left font-medium text-gray-600 hover:bg-gray-100">
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

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

export default function DashboardLayout({ children }) {
  return (
    <ActivosProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </ActivosProvider>
  );
}