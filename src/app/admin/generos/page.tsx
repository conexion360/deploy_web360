// src/app/admin/generos/page.tsx
'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '../components/AdminLayout';

interface Genero {
  id: number;
  nombre: string;
  descripcion: string | null;
  imagen: string;
  icono: string | null;
  orden: number;
  activo: boolean;
}

export default function GenerosAdmin() {
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cargar los géneros
  useEffect(() => {
    const fetchGeneros = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/generos', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al cargar los géneros');
        }
        
        const data = await response.json();
        setGeneros(data);
      } catch (error) {
        console.error('Error fetching genres:', error);
        setError('No se pudieron cargar los géneros. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchGeneros();
  }, []);

  const handleToggleActive = async (id: number) => {
    try {
      // Encontrar el género actual
      const genero = generos.find(g => g.id === id);
      if (!genero) return;
      
      // Actualizar en la API
      const response = await fetch(`/api/generos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          ...genero,
          activo: !genero.activo
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar el género');
      }
      
      // Actualizar el estado local
      setGeneros(generos.map(genero => 
        genero.id === id ? { ...genero, activo: !genero.activo } : genero
      ));
      
      setSuccess('Género actualizado correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error toggling genre active state:', error);
      setError('No se pudo actualizar el género. Por favor, intenta de nuevo.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleMoveUp = async (id: number) => {
    const currentIndex = generos.findIndex(genero => genero.id === id);
    if (currentIndex > 0) {
      try {
        const currentGenero = generos[currentIndex];
        const prevGenero = generos[currentIndex - 1];
        
        // Intercambiar órdenes en la API
        await Promise.all([
          fetch(`/api/generos/${currentGenero.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({
              ...currentGenero,
              orden: prevGenero.orden
            })
          }),
          fetch(`/api/generos/${prevGenero.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({
              ...prevGenero,
              orden: currentGenero.orden
            })
          })
        ]);
        
        // Actualizar el estado local
        const newGeneros = [...generos];
        newGeneros[currentIndex] = { ...prevGenero, orden: currentGenero.orden };
        newGeneros[currentIndex - 1] = { ...currentGenero, orden: prevGenero.orden };
        newGeneros.sort((a, b) => a.orden - b.orden);
        setGeneros(newGeneros);
        
        setSuccess('Orden actualizado correctamente');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error updating genre order:', error);
        setError('No se pudo actualizar el orden. Por favor, intenta de nuevo.');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleMoveDown = async (id: number) => {
    const currentIndex = generos.findIndex(genero => genero.id === id);
    if (currentIndex < generos.length - 1) {
      try {
        const currentGenero = generos[currentIndex];
        const nextGenero = generos[currentIndex + 1];
        
        // Intercambiar órdenes en la API
        await Promise.all([
          fetch(`/api/generos/${currentGenero.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({
              ...currentGenero,
              orden: nextGenero.orden
            })
          }),
          fetch(`/api/generos/${nextGenero.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({
              ...nextGenero,
              orden: currentGenero.orden
            })
          })
        ]);
        
        // Actualizar el estado local
        const newGeneros = [...generos];
        newGeneros[currentIndex] = { ...nextGenero, orden: currentGenero.orden };
        newGeneros[currentIndex + 1] = { ...currentGenero, orden: nextGenero.orden };
        newGeneros.sort((a, b) => a.orden - b.orden);
        setGeneros(newGeneros);
        
        setSuccess('Orden actualizado correctamente');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error updating genre order:', error);
        setError('No se pudo actualizar el orden. Por favor, intenta de nuevo.');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este género? Esta acción no se puede deshacer.')) {
      try {
        const response = await fetch(`/api/generos/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Error al eliminar el género');
        }
        
        // Actualizar el estado local
        setGeneros(generos.filter(genero => genero.id !== id));
        
        setSuccess('Género eliminado correctamente');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error: any) {
        console.error('Error deleting genre:', error);
        setError(error.message || 'No se pudo eliminar el género. Por favor, intenta de nuevo.');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Géneros Musicales</h1>
          <Link 
            href="/admin/generos/nuevo" 
            className="bg-secondary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-secondary-light transition-colors"
          >
            <span className="material-icons-outlined">add</span>
            <span>Agregar Género</span>
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
          </div>
        ) : generos.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">No hay géneros disponibles. Agrega uno para comenzar.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Imagen
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orden
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {generos.map((genero) => (
                    <tr key={genero.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-16 w-24 bg-gray-200 rounded overflow-hidden">
                          <div 
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${genero.imagen})` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {genero.icono && (
                            <span className="material-icons-outlined text-gray-500 mr-2">
                              {genero.icono}
                            </span>
                          )}
                          <div className="text-sm font-medium text-gray-900">{genero.nombre}</div>
                        </div>
                        {genero.descripcion && (
                          <div className="text-sm text-gray-500 line-clamp-1">{genero.descripcion}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleMoveUp(genero.id)}
                            disabled={genero.orden === 1}
                            className={`p-1 rounded ${genero.orden === 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
                          >
                            <span className="material-icons-outlined text-sm">arrow_upward</span>
                          </button>
                          <span className="text-sm text-gray-600">{genero.orden}</span>
                          <button 
                            onClick={() => handleMoveDown(genero.id)}
                            disabled={genero.orden === generos.length}
                            className={`p-1 rounded ${genero.orden === generos.length ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
                          >
                            <span className="material-icons-outlined text-sm">arrow_downward</span>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${genero.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {genero.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-3">
                          <button 
                            onClick={() => handleToggleActive(genero.id)}
                            className={`p-1 rounded ${genero.activo ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                            title={genero.activo ? 'Desactivar' : 'Activar'}
                          >
                            <span className="material-icons-outlined">
                              {genero.activo ? 'visibility_off' : 'visibility'}
                            </span>
                          </button>
                          <Link
                            href={`/admin/generos/editar/${genero.id}`}
                            className="p-1 rounded text-blue-600 hover:bg-blue-50"
                            title="Editar"
                          >
                            <span className="material-icons-outlined">edit</span>
                          </Link>
                          <button
                            onClick={() => handleDelete(genero.id)}
                            className="p-1 rounded text-red-600 hover:bg-red-50"
                            title="Eliminar"
                          >
                            <span className="material-icons-outlined">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}