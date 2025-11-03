// src/app/context/ActivosContext.js
"use client";
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const ActivosContext = createContext(null);

export function ActivosProvider({ children }) {
  const [activos, setActivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // --- NUEVO: ESTADO PARA EL MODAL DE MOVIMIENTO ---
  const [isMovModalOpen, setIsMovModalOpen] = useState(false);
  const [selectedActivo, setSelectedActivo] = useState(null);

  const fetchActivos = useCallback(async () => {
    // No ponemos setLoading(true) aquí para que la tabla no parpadee
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/');
        return;
      }
      const response = await axios.get('http://localhost:5000/api/activos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setActivos(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los activos.');
      console.error('Error en fetchActivos:', err);
      if (err.response && err.response.status === 401) {
        router.push('/');
      }
    } finally {
      setLoading(false); // Ponemos loading false solo al final
    }
  }, [router]);

  useEffect(() => {
    fetchActivos(); // Carga inicial
  }, [fetchActivos]);

  // --- NUEVAS FUNCIONES PARA EL MODAL ---
  const openMovModal = (activo) => {
    setSelectedActivo(activo);
    setIsMovModalOpen(true);
  };

  const closeMovModal = () => {
    setIsMovModalOpen(false);
    setSelectedActivo(null);
    fetchActivos(); // Refresca la tabla al cerrar
  };

  // Valores que compartirá el contexto
  const value = {
    activos,
    loading,
    error,
    fetchActivos, // El modal de "Agregar" también usa esto
    isMovModalOpen,
    selectedActivo,
    openMovModal, // La tabla usa esto
    closeMovModal // El layout usa esto
  };

  return (
    <ActivosContext.Provider value={value}>
      {children}
    </ActivosContext.Provider>
  );
}

// Hook personalizado
export function useActivos() {
  return useContext(ActivosContext);
}