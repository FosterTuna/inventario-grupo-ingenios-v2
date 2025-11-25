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

  const [isMovModalOpen, setIsMovModalOpen] = useState(false);
  const [selectedActivo, setSelectedActivo] = useState(null);
  
  // --- CAMBIOS AQUÍ: Añadimos estados para los filtros ---
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [tipo, setTipo] = useState('');
  const [bodega, setBodega] = useState('');
  const [estante, setEstante] = useState(''); // <-- CAMBIO: Añadido 'estante'
  // --- FIN DE CAMBIOS ---

  // --- CAMBIO: fetchActivos ahora usa los 5 filtros ---
  const fetchActivos = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/');
        return;
      }
      
      const params = {};
      if (search) params.search = search;
      if (estado) params.estado = estado;
      if (tipo) params.tipo_activo = tipo;
      if (bodega) params.bodega = bodega; // <-- Corregido para que coincida con el backend
      if (estante) params.estante = estante; // <-- CAMBIO: Añadido 'estante'

      const response = await axios.get('http://localhost:5000/api/activos', {
        headers: { 'Authorization': `Bearer ${token}` },
        params: params
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
      setLoading(false);
    }
  }, [router, search, estado, tipo, bodega, estante]); // <-- CAMBIO: Añadido 'estante'
  // --- FIN DE CAMBIOS ---

  useEffect(() => {
    fetchActivos();
  }, [fetchActivos]);

  // ... (openMovModal y closeMovModal se mantienen igual) ...
  const openMovModal = (activo) => {
    setSelectedActivo(activo);
    setIsMovModalOpen(true);
  };
  const closeMovModal = () => {
    setIsMovModalOpen(false);
    setSelectedActivo(null);
    fetchActivos();
  };

  // --- CAMBIO: Exponemos los filtros y sus 'setters' ---
  const value = {
    activos,
    loading,
    error,
    fetchActivos,
    isMovModalOpen,
    selectedActivo,
    openMovModal,
    closeMovModal,
    search, setSearch,
    estado, setEstado,
    tipo, setTipo,
    bodega, setBodega,
    estante, setEstante // <-- CAMBIO: Añadido 'estante'
  };
  // --- FIN DE CAMBIOS ---

  return (
    <ActivosContext.Provider value={value}>
      {children}
    </ActivosContext.Provider>
  );
}

export function useActivos() {
  return useContext(ActivosContext);
}