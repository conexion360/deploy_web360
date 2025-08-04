// src/app/admin/generos/editar/[id]/page.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '../../../components/AdminLayout';

export default function EditarGenero() {
  const params = useParams();
  const id = params.id;
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    icono: '',
    orden: 1,
    activo: true
  });
  
  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imagenActual, setImagenActual] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();

  // Cargar datos del género
  useEffect(() => {
    const fetchGenero = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/generos/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al cargar el género');
        }
        
        const data = await response.json();
        setFormData({
          nombre: data.nombre || '',
          descripcion: data.descripcion || '',
          icono: data.icono || '',
          orden: data.orden,
          activo: data.activo
        });
        
        // Guardar la URL de la imagen actual
        setImagenActual(data.imagen);
        setPreview(data.imagen);
      } catch (error) {
        console.error('Error fetching genre:', error);
        setError('No se pudo cargar el género. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchGenero();
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setImagen(file);
      setPreview(fileUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      
      // Preparar el objeto para actualizar
      const updateData: any = { ...formData };
      
      // Si se ha cambiado la imagen, subirla
      if (imagen) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', imagen);
        formDataUpload.append('folder', 'generos');
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: formDataUpload
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Error al subir la imagen');
        }
        
        const uploadData = await uploadResponse.json();
        updateData.imagen = uploadData.url;
      } else {
        // Mantener la imagen actual
        updateData.imagen = imagenActual;
      }
      
      // Actualizar el género
      const response = await fetch(`/api/generos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar el género');
      }
      
      // Redireccionar a la página de administración de géneros
      router.push('/admin/generos');
    } catch (error: any) {
      setError(error.message || 'Error al actualizar el género');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Editar Género Musical</h1>
          <button
            onClick={() => router.push('/admin/generos')}
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

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del género
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
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
                  <label htmlFor="icono" className="block text-sm font-medium text-gray-700 mb-1">
                    Icono (Material Icons)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      id="icono"
                      name="icono"
                      value={formData.icono}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                      placeholder="music_note"
                    />
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="material-icons-outlined text-gray-600">
                        {formData.icono || 'help_outline'}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Nombre del icono de Material Icons
                  </p>
                </div>
                
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
                    Activo
                  </label>
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="imagen" className="block text-sm font-medium text-gray-700 mb-1">
                    Imagen
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      id="imagen"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="imagen"
                      className="bg-gray-100 border border-gray-300 rounded-md px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors"
                    >
                      {preview ? "Cambiar imagen" : "Seleccionar archivo"}
                    </label>
                    {preview && (
                      <div className="h-24 w-24 bg-gray-200 rounded overflow-hidden">
                        <img
                          src={preview}
                          alt="Vista previa"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Tamaño recomendado: 600x400px
                  </p>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => router.push('/admin/generos')}
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