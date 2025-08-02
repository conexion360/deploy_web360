// src/app/admin/hero/editar/[id]/page.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '../../../components/AdminLayout';

export default function EditarHeroSlide() {
  const params = useParams();
  const id = params.id;
  
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    orden: 1,
    activo: true
  });
  
  const [imagenDesktop, setImagenDesktop] = useState<File | null>(null);
  const [imagenMobile, setImagenMobile] = useState<File | null>(null);
  const [previewDesktop, setPreviewDesktop] = useState<string | null>(null);
  const [previewMobile, setPreviewMobile] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const router = useRouter();

  // Cargar datos del slide
  useEffect(() => {
    const fetchSlide = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/hero/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al cargar el slide');
        }
        
        const data = await response.json();
        setFormData({
          titulo: data.titulo || '',
          descripcion: data.descripcion || '',
          orden: data.orden,
          activo: data.activo
        });
        
        // Establecer las previsualizaciones
        if (data.imagen_desktop) {
          setPreviewDesktop(data.imagen_desktop);
        }
        
        if (data.imagen_mobile) {
          setPreviewMobile(data.imagen_mobile);
        }
      } catch (error) {
        console.error('Error fetching slide:', error);
        setError('No se pudo cargar el slide. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchSlide();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isMobile: boolean) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      
      if (isMobile) {
        setImagenMobile(file);
        setPreviewMobile(fileUrl);
      } else {
        setImagenDesktop(file);
        setPreviewDesktop(fileUrl);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      
      // Preparar el objeto para actualizar
      const updateData: any = { ...formData };
      
      // Subir imagen desktop si se ha cambiado
      if (imagenDesktop) {
        const formDataDesktop = new FormData();
        formDataDesktop.append('file', imagenDesktop);
        formDataDesktop.append('folder', 'hero');
        
        const uploadDesktopResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: formDataDesktop
        });
        
        if (!uploadDesktopResponse.ok) {
          throw new Error('Error al subir la imagen desktop');
        }
        
        const desktopData = await uploadDesktopResponse.json();
        updateData.imagen_desktop = desktopData.url;
      }
      
      // Subir imagen mobile si se ha cambiado
      if (imagenMobile) {
        const formDataMobile = new FormData();
        formDataMobile.append('file', imagenMobile);
        formDataMobile.append('folder', 'hero');
        
        const uploadMobileResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: formDataMobile
        });
        
        if (!uploadMobileResponse.ok) {
          throw new Error('Error al subir la imagen mobile');
        }
        
        const mobileData = await uploadMobileResponse.json();
        updateData.imagen_mobile = mobileData.url;
      }
      
      // Actualizar el slide
      const response = await fetch(`/api/hero/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar el slide');
      }
      
      setSuccess('Slide actualizado correctamente');
      setTimeout(() => {
        router.push('/admin/hero');
      }, 2000);
      
    } catch (error: any) {
      setError(error.message || 'Error al actualizar el slide');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Editar Hero Slide</h1>
          <button
            onClick={() => router.push('/admin/hero')}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-300 transition-colors"
          >
            <span className="material-icons-outlined">arrow_back</span>
            <span>Volver</span>
          </button>
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
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    id="titulo"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="orden" className="block text-sm font-medium text-gray-700 mb-1">
                    Orden
                  </label>
                  <input
                    type="number"
                    id="orden"
                    name="orden"
                    min="1"
                    value={formData.orden}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción (opcional)
                  </label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                  />
                </div>
                
                <div>
                  <label htmlFor="imagenDesktop" className="block text-sm font-medium text-gray-700 mb-1">
                    Imagen Desktop
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      id="imagenDesktop"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, false)}
                      className="hidden"
                    />
                    <label
                      htmlFor="imagenDesktop"
                      className="bg-gray-100 border border-gray-300 rounded-md px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors"
                    >
                      Cambiar imagen
                    </label>
                    {previewDesktop && (
                      <div className="h-16 w-24 bg-gray-200 rounded overflow-hidden">
                        <img
                          src={previewDesktop}
                          alt="Vista previa"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Tamaño recomendado: 1920x1080px
                  </p>
                </div>
                
                <div>
                  <label htmlFor="imagenMobile" className="block text-sm font-medium text-gray-700 mb-1">
                    Imagen Mobile
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      id="imagenMobile"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, true)}
                      className="hidden"
                    />
                    <label
                      htmlFor="imagenMobile"
                      className="bg-gray-100 border border-gray-300 rounded-md px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors"
                    >
                      Cambiar imagen
                    </label>
                    {previewMobile && (
                      <div className="h-16 w-12 bg-gray-200 rounded overflow-hidden">
                        <img
                          src={previewMobile}
                          alt="Vista previa"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Tamaño recomendado: 768x1024px
                  </p>
                </div>
                
                <div className="md:col-span-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="activo"
                      name="activo"
                      checked={formData.activo}
                      onChange={handleChange}
                      className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                    />
                    <label htmlFor="activo" className="ml-2 block text-sm text-gray-700">
                      Slide activo
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => router.push('/admin/hero')}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-4 hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary-light transition-colors flex items-center"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}