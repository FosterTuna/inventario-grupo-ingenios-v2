// src/app/components/RegistrarMovimientoModal.js
"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useActivos } from '../context/ActivosContext';

// --- CORRECCIÓN: Mover la constante FUERA del componente ---
// Así no se recrea en cada render y no causa problemas de dependencias.
const ROLES_RECEPTORES = ['Jefe', 'Sub-Jefe', 'Encargado', 'Trabajador'];

export default function RegistrarMovimientoModal({ onClose, activo }) {
  const { fetchActivos } = useActivos();

  // Estados para el formulario
  const [usuarios, setUsuarios] = useState([]);
  const [id_usuario_dispone, setUsuarioDispone] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [observaciones, setObservaciones] = useState('');
  const [error, setError] = useState('');
  
  // Estados para modo visitante
  const [modoReceptor, setModoReceptor] = useState('interno'); 
  const [nombreVisitante, setNombreVisitante] = useState('');
  const [apellidosVisitante, setApellidosVisitante] = useState('');

  // --- Carga los usuarios cuando el modal se abre ---
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:5000/api/usuarios', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const usuariosFiltrados = response.data.filter(u => 
          ROLES_RECEPTORES.includes(u.rol) && u.activo === true
        );
        setUsuarios(usuariosFiltrados);
      } catch (err) {
        setError('Error al cargar la lista de usuarios. Asegúrate de estar logueado.');
      }
    };
    fetchUsuarios();
  }, []); // Ya no marca error porque ROLES_RECEPTORES es constante externa

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (cantidad <= 0 || cantidad > activo.stock_disponible) {
      setError('La cantidad a retirar es inválida o supera el stock disponible.');
      return;
    }

    if (modoReceptor === 'interno' && !id_usuario_dispone) {
        setError('Por favor, selecciona un usuario interno.');
        return;
    }
    
    if (modoReceptor === 'visitante' && (!nombreVisitante.trim() || !apellidosVisitante.trim())) {
        setError('Debes ingresar el nombre y apellido del visitante.');
        return;
    }

    try {
      const token = localStorage.getItem('authToken');
      
      const body = {
        id_activo: activo._id,
        cantidad: Number(cantidad),
        observaciones: observaciones,
        id_usuario_dispone: modoReceptor === 'interno' ? id_usuario_dispone : null,
        nombre_visitante: modoReceptor === 'visitante' ? nombreVisitante : null,
        apellidos_visitante: modoReceptor === 'visitante' ? apellidosVisitante : null,
      };

      await axios.post('http://localhost:5000/api/movimientos/salida', body, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      await fetchActivos();
      onClose();

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al registrar la salida.');
    }
  };

  if (!activo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Registrar Salida de Activo</h2>

        <div className="mb-4 rounded-md border-2 border-blue-200 bg-blue-50 p-4">
          <p className="text-xl font-extrabold text-gray-900">{activo.nombre}</p>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <p className="font-medium">SKU: <span className="font-bold text-gray-800">{activo.sku}</span></p>
            <p className="font-medium">Disponible: <span className="text-xl font-bold text-green-600">{activo.stock_disponible}</span> unid.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <label htmlFor="modoReceptor" className="block text-sm font-medium text-gray-700">¿Quién solicita el material?</label>
                <select
                    id="modoReceptor"
                    value={modoReceptor}
                    onChange={(e) => setModoReceptor(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm sm:text-sm"
                >
                    <option value="interno">Usuario Interno (Empleado)</option>
                    <option value="visitante">Visitante (Ajenos a la empresa)</option>
                </select>
            </div>

            {/* FORMULARIO DE USUARIO INTERNO */}
            {modoReceptor === 'interno' && (
                <div className="mb-4">
                    <label htmlFor="usuario_dispone" className="block text-sm font-medium text-gray-700">Usuario que Solicita (Dispone)*</label>
                    <select
                        id="usuario_dispone"
                        value={id_usuario_dispone}
                        onChange={(e) => setUsuarioDispone(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm sm:text-sm"
                    >
                        <option value="">Seleccionar usuario...</option>
                        {usuarios.map(user => (
                            <option key={user._id} value={user._id}>
                            {user.nombre_completo} ({user.rol})
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* FORMULARIO DE VISITANTE */}
            {modoReceptor === 'visitante' && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label htmlFor="nombreVisitante" className="block text-sm font-medium text-gray-700">Nombre del Visitante*</label>
                        <input
                            type="text"
                            id="nombreVisitante"
                            value={nombreVisitante}
                            onChange={(e) => setNombreVisitante(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="apellidosVisitante" className="block text-sm font-medium text-gray-700">Apellidos del Visitante*</label>
                        <input
                            type="text"
                            id="apellidosVisitante"
                            value={apellidosVisitante}
                            onChange={(e) => setApellidosVisitante(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm sm:text-sm"
                            required
                        />
                    </div>
                </div>
            )}
            
            <div className="mb-4">
                <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700">Cantidad a Retirar*</label>
                <input
                    type="number"
                    id="cantidad"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm sm:text-sm"
                    min="1"
                    max={activo.stock_disponible}
                    required
                />
            </div>

            <div className="mb-4">
                <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700">Observaciones</label>
                <textarea
                    id="observaciones"
                    rows={3}
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm sm:text-sm"
                ></textarea>
            </div>

            {error && (
                <p className="my-2 text-center text-sm text-red-600">{error}</p>
            )}

            <div className="mt-6 flex justify-end space-x-4">
                <button type="button" onClick={onClose} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">Confirmar Salida</button>
            </div>
        </form>
      </div>
    </div>
  );
}