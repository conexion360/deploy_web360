// src/app/admin/galeria/page.tsx
'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '../components/AdminLayout';

interface GaleriaItem {
  id: number;
  titulo: string;
  descripcion: string | null;
  imagen: string;
  thumbnail: string | null;
  orden: number;
  categoria: string | null;
  destacado: boolean;
}

export default function GaleriaAdmin() {
  const [items, setItems] = useState<GaleriaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<string[]>([]);

  // Cargar los items de la galería
  useEffect(() => {
    const fetchGaleria = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/galeria', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al cargar la galería');
        }
        
        const data = await response.json();
        setItems(data);
        
        // Extraer categorías únicas
        const uniqueCategorias = Array.from(
          new Set(data.map((item: GaleriaItem) => item.categoria).filter(Boolean))
        ) as string[];
        
        setCategorias(uniqueCategorias);
      } catch (error) {
        console.error('Error fetching gallery:', error);
        setError('No se pudo cargar la galería. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchGaleria();
  }, []);

  const handleToggleDestacado = async (id: number) => {
    try {
      // Encontrar el item actual
      const item = items.find(item => item.id === id);
      if (!item) return;
      
      // Actualizar en la API
      const response = await fetch(`/api/galeria/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          ...item,
          destacado: !item.destacado
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar la imagen');
      }
      
      // Actualizar el estado local
      setItems(items.map(item => 
        item.id === id ? { ...item, destacado: !item.destacado } : item
      ));
      
      setSuccess('Imagen actualizada correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error toggling destacado state:', error);
      setError('No se pudo actualizar la imagen. Por favor, intenta de nuevo.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta imagen? Esta acción no se puede deshacer.')) {
      try {
        const response = await fetch(`/api/galeria/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al eliminar la imagen');
        }
        
        // Actualizar el estado local
        setItems(items.filter(item => item.id !== id));
        
        setSuccess('Imagen eliminada correctamente');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error deleting gallery item:', error);
        setError('No se pudo eliminar la imagen. Por favor, intenta de nuevo.');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  // Filtrar items por categoría si hay un filtro activo
  const filteredItems = categoriaFilter
    ? items.filter(item => item.categoria === categoriaFilter)
    : items;

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Galería de Imágenes</h1>
          <div className="flex space-x-2">
            <Link 
              href="/admin/galeria/bulk-upload" 
              className="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-light transition-colors"
            >
              <span className="material-icons-outlined">file_upload</span>
              <span>Carga Masiva</span>
            </Link>
            <Link 
              href="/admin/galeria/nueva" 
              className="bg-secondary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-secondary-light transition-colors"
            >
              <span className="material-icons-outlined">add</span>
              <span>Agregar Imagen</span>
            </Link>
          </div>
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
        
        {/* Filtros de categoría */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Filtrar por categoría:</span>
            <button
              onClick={() => setCategoriaFilter(null)}
              className={`px-3 py-1 rounded-full text-sm ${
                categoriaFilter === null 
                  ? 'bg-secondary text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todas
            </button>
            {categorias.map(categoria => (
              <button
                key={categoria}
                onClick={() => setCategoriaFilter(categoria)}
                className={`px-3 py-1 rounded-full text-sm ${
                  categoriaFilter === categoria 
                    ? 'bg-secondary text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {categoria}
              </button>
            ))}
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">
              {categoriaFilter 
                ? `No hay imágenes en la categoría "${categoriaFilter}".` 
                : 'No hay imágenes disponibles. Agrega una para comenzar.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="relative aspect-w-4 aspect-h-3">
                  <div 
                    className="w-full h-48 bg-cover bg-center"
                    style={{ backgroundImage: `url(${item.imagen})` }}
                  >
                    {item.destacado && (
                      <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                        Destacado
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 truncate">{item.titulo}</h3>
                  {item.categoria && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      {item.categoria}
                    </span>
                  )}
                  <p className="text-gray-500 text-sm mt-2 line-clamp-2">{item.descripcion}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-500">Orden: {item.orden}</span>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleToggleDestacado(item.id)}
                        className={`p-1 rounded ${item.destacado ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-600`}
                        title={item.destacado ? 'Quitar destacado' : 'Destacar'}
                      >
                        <span className="material-icons-outlined">star</span>
                      </button>
                      <Link
                        href={`/admin/galeria/editar/${item.id}`}
                        className="p-1 rounded text-blue-600 hover:bg-blue-50"
                        title="Editar"
                      >
                        <span className="material-icons-outlined">edit</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 rounded text-red-600 hover:bg-red-50"
                        title="Eliminar"
                      >
                        <span className="material-icons-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}