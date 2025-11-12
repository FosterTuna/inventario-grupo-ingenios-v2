// app/dashboard/usuarios/page.js
"use client";

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import AddUsuarioModal from '../../components/AddUsuarioModal'; 
import EditUsuarioModal from '../../components/EditUsuarioModal'; // <-- CAMBIO: Importamos el modal de edición

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  
  // Estados para los modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // <-- CAMBIO: Estado para el modal de edición
  const [selectedUser, setSelectedUser] = useState(null); // <-- CAMBIO: Para saber a quién editar

  // Función para cargar usuarios (sin cambios)
  const fetchUsuarios = useCallback(async () => {
    // ... (el código de fetchUsuarios es el mismo que ya tenías) ...
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/');
        return;
      }
      const response = await axios.get('http://localhost:5000/api/usuarios', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUsuarios(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError('Error al cargar los usuarios.');
      setLoading(false);
      if (err.response && err.response.status === 401) {
        router.push('/');
      }
    }
  }, [router]);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);
  
  // --- CAMBIO: Actualizamos la función handleEdit ---
  const handleEdit = (user) => {
    setSelectedUser(user); // 1. Guarda el usuario seleccionado
    setIsEditModalOpen(true); // 2. Abre el modal de edición
  };

  // La función de eliminar se mantiene (sin cambios)
  const handleDelete = async (userId, userNickName) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar al usuario "${userNickName}"?`)) {
      return;
    }
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`http://localhost:5000/api/usuarios/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchUsuarios(); 
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      setError(err.response?.data?.message || 'Error al eliminar el usuario.');
    }
  };

  // --- CAMBIOS EN LAS FUNCIONES DE LOS MODALES ---
  const handleUserAdded = () => {
    setIsAddModalOpen(false);
    fetchUsuarios();
  };
  
  const handleUserUpdated = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
    fetchUsuarios();
  };
  // --- FIN DE CAMBIOS ---

  if (loading) {
    return <div className="text-gray-900">Cargando usuarios...</div>;
  }
  
  return (
    <div>
      {/* ... (Encabezado y Botón se mantienen igual) ... */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="rounded-lg bg-blue-600 px-5 py-2.5 font-bold text-white hover:bg-blue-700"
        >
          + Nuevo Usuario
        </button>
      </div>
      
      {error && (
        <div className="my-4 rounded-md bg-red-100 p-3 text-center text-red-700">
          {error}
        </div>
      )}

      {/* ... (Tarjetas de resumen se mantienen igual) ... */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="rounded-lg bg-white p-4 shadow-md text-center">
          <p className="text-sm font-medium text-gray-500">Total Usuarios</p>
          <p className="text-3xl font-bold text-gray-900">{usuarios.length}</p>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="rounded-lg bg-white shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-gray-900">
          {/* ... (El 'thead' se mantiene igual) ... */}
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nick-name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nombre Completo</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {usuarios.length > 0 ? (
              usuarios.map((user) => (
                <tr key={user._id}>
                  {/* ... (Otras celdas se mantienen igual) ... */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{user['nick-name']}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{user.nombre_completo}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      user.rol === 'Jefe' ? 'bg-purple-100 text-purple-800' :
                      user.rol === 'Sub-Jefe' ? 'bg-blue-100 text-blue-800' :
                      user.rol === 'Encargado' ? 'bg-green-100 text-green-800' :
                      user.rol === 'Practicante' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.rol}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      user.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  
                  {/* --- CAMBIO EN BOTÓN EDITAR --- */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {/* Le pasamos el objeto 'user' completo a la función */}
                    <button 
                      onClick={() => handleEdit(user)} 
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(user._id, user['nick-name'])} 
                      className="ml-4 text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm">No se encontraron usuarios.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- CAMBIO: Renderizado de AMBOS modales --- */}
      {isAddModalOpen && (
        <AddUsuarioModal 
          onClose={() => setIsAddModalOpen(false)} 
          onUserAdded={handleUserAdded} 
        />
      )}
      {isEditModalOpen && (
        <EditUsuarioModal 
          user={selectedUser}
          onClose={() => setIsEditModalOpen(false)}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </div>
  );
}