// src/app/admin/hero/page.tsx
'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '../components/AdminLayout';

interface HeroSlide {
  id: number;
  titulo: string;
  descripcion: string | null;
  imagen_desktop: string;
  imagen_mobile: string;
  orden: number;
  activo: boolean;
}

export default function HeroAdmin() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cargar los slides desde la API
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/hero', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al cargar los slides');
        }
        
        const data = await response.json();
        setSlides(data);
      } catch (error) {
        console.error('Error fetching slides:', error);
        setError('No se pudieron cargar los slides. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSlides();
  }, []);

  const handleToggleActive = async (id: number) => {
    try {
      // Encontrar el slide actual
      const slide = slides.find(s => s.id === id);
      if (!slide) return;
      
      // Actualizar en la API
      const response = await fetch(`/api/hero/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          ...slide,
          activo: !slide.activo
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar el slide');
      }
      
      // Actualizar el estado local
      setSlides(slides.map(slide => 
        slide.id === id ? { ...slide, activo: !slide.activo } : slide
      ));
      
      setSuccess('Slide actualizado correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error toggling slide active state:', error);
      setError('No se pudo actualizar el slide. Por favor, intenta de nuevo.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleMoveUp = async (id: number) => {
    const currentIndex = slides.findIndex(slide => slide.id === id);
    if (currentIndex > 0) {
      try {
        const currentSlide = slides[currentIndex];
        const prevSlide = slides[currentIndex - 1];
        
        // Intercambiar órdenes en la API
        await Promise.all([
          fetch(`/api/hero/${currentSlide.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({
              ...currentSlide,
              orden: prevSlide.orden
            })
          }),
          fetch(`/api/hero/${prevSlide.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({
              ...prevSlide,
              orden: currentSlide.orden
            })
          })
        ]);
        
        // Actualizar el estado local
        const newSlides = [...slides];
        newSlides[currentIndex] = { ...prevSlide, orden: currentSlide.orden };
        newSlides[currentIndex - 1] = { ...currentSlide, orden: prevSlide.orden };
        newSlides.sort((a, b) => a.orden - b.orden);
        setSlides(newSlides);
        
        setSuccess('Orden actualizado correctamente');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error updating slide order:', error);
        setError('No se pudo actualizar el orden. Por favor, intenta de nuevo.');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleMoveDown = async (id: number) => {
    const currentIndex = slides.findIndex(slide => slide.id === id);
    if (currentIndex < slides.length - 1) {
      try {
        const currentSlide = slides[currentIndex];
        const nextSlide = slides[currentIndex + 1];
        
        // Intercambiar órdenes en la API
        await Promise.all([
          fetch(`/api/hero/${currentSlide.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({
              ...currentSlide,
              orden: nextSlide.orden
            })
          }),
          fetch(`/api/hero/${nextSlide.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({
              ...nextSlide,
              orden: currentSlide.orden
            })
          })
        ]);
        
        // Actualizar el estado local
        const newSlides = [...slides];
        newSlides[currentIndex] = { ...nextSlide, orden: currentSlide.orden };
        newSlides[currentIndex + 1] = { ...currentSlide, orden: nextSlide.orden };
        newSlides.sort((a, b) => a.orden - b.orden);
        setSlides(newSlides);
        
        setSuccess('Orden actualizado correctamente');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error updating slide order:', error);
        setError('No se pudo actualizar el orden. Por favor, intenta de nuevo.');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este slide? Esta acción no se puede deshacer.')) {
      try {
        const response = await fetch(`/api/hero/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al eliminar el slide');
        }
        
        // Actualizar el estado local
        setSlides(slides.filter(slide => slide.id !== id));
        
        setSuccess('Slide eliminado correctamente');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error deleting slide:', error);
        setError('No se pudo eliminar el slide. Por favor, intenta de nuevo.');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Hero Slides</h1>
          <Link 
            href="/admin/hero/nuevo" 
            className="bg-secondary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-secondary-light transition-colors"
          >
            <span className="material-icons-outlined">add</span>
            <span>Agregar Slide</span>
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
        ) : slides.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">No hay slides disponibles. Agrega uno para comenzar.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vista previa
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Título
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
                  {slides.map((slide) => (
                    <tr key={slide.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-16 w-24 bg-gray-200 rounded overflow-hidden">
                          <div 
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${slide.imagen_desktop})` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{slide.titulo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleMoveUp(slide.id)}
                            disabled={slide.orden === 1}
                            className={`p-1 rounded ${slide.orden === 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
                          >
                            <span className="material-icons-outlined text-sm">arrow_upward</span>
                          </button>
                          <span className="text-sm text-gray-600">{slide.orden}</span>
                          <button 
                            onClick={() => handleMoveDown(slide.id)}
                            disabled={slide.orden === slides.length}
                            className={`p-1 rounded ${slide.orden === slides.length ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
                          >
                            <span className="material-icons-outlined text-sm">arrow_downward</span>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${slide.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {slide.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-3">
                          <button 
                            onClick={() => handleToggleActive(slide.id)}
                            className={`p-1 rounded ${slide.activo ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                            title={slide.activo ? 'Desactivar' : 'Activar'}
                          >
                            <span className="material-icons-outlined">
                              {slide.activo ? 'visibility_off' : 'visibility'}
                            </span>
                          </button>
                          <Link
                            href={`/admin/hero/editar/${slide.id}`}
                            className="p-1 rounded text-blue-600 hover:bg-blue-50"
                            title="Editar"
                          >
                            <span className="material-icons-outlined">edit</span>
                          </Link>
                          <button
                            onClick={() => handleDelete(slide.id)}
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