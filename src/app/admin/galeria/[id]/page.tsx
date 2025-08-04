// src/app/admin/galeria/editar/[id]/page.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';
export default function EditarGaleria() {
  const params = useParams();
  const id = params.id;
  
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    orden: 1,
    destacado: false
  });
  
  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imagenActual, setImagenActual] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [mostrarNuevaCategoria, setMostrarNuevaCategoria] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();

  // Cargar categorías existentes
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await fetch('/api/galeria', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al cargar las categorías');
        }
        
        const data = await response.json();
        
        // Extraer categorías únicas
        const uniqueCategorias = Array.from(
          new Set(data.map((item: any) => item.categoria).filter(Boolean))
        ) as string[];
        
        setCategorias(uniqueCategorias);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchCategorias();
  }, []);

  // Cargar datos de la imagen
  useEffect(() => {
    const fetchImage = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/galeria/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al cargar la imagen');
        }
        
        const data = await response.json();
        setFormData({
          titulo: data.titulo || '',
          descripcion: data.descripcion || '',
          categoria: data.categoria || '',
          orden: data.orden,
          destacado: data.destacado
        });
        
        // Guardar la URL de la imagen actual
        setImagenActual(data.imagen);
        setPreview(data.imagen);
      } catch (error) {
        console.error('Error fetching image:', error);
        setError('No se pudo cargar la imagen. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchImage();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
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

  const handleAddCategoria = () => {
    if (nuevaCategoria.trim() && !categorias.includes(nuevaCategoria.trim())) {
      setCategorias([...categorias, nuevaCategoria.trim()]);
      setFormData(prev => ({
        ...prev,
        categoria: nuevaCategoria.trim()
      }));
      setNuevaCategoria('');
      setMostrarNuevaCategoria(false);
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
        formDataUpload.append('folder', 'galeria');
        
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
        updateData.thumbnail = uploadData.url; // Usar la misma imagen como miniatura
      } else {
        // Mantener la imagen actual
        updateData.imagen = imagenActual;
      }
      
      // Actualizar la imagen
      const response = await fetch(`/api/galeria/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar la imagen');
      }
      
      // Redireccionar a la página de administración de galería
      router.push('/admin/galeria');
      
    } catch (error: any) {
      setError(error.message || 'Error al actualizar la imagen');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Editar Imagen en Galería</h1>
          <button
            onClick={() => router.push('/admin/galeria')}
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
                  <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <div className="flex items-center space-x-2">
                    {!mostrarNuevaCategoria ? (
                      <>
                        <select
                          id="categoria"
                          name="categoria"
                          value={formData.categoria}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                        >
                          <option value="">Seleccionar categoría</option>
                          {categorias.map(cat => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setMostrarNuevaCategoria(true)}
                          className="bg-gray-100 p-2 rounded-md text-gray-600 hover:bg-gray-200"
                        >
                          <span className="material-icons-outlined">add</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <input
                          type="text"
                          value={nuevaCategoria}
                          onChange={(e) => setNuevaCategoria(e.target.value)}
                          placeholder="Nueva categoría"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                        />
                        <button
                          type="button"
                          onClick={handleAddCategoria}
                          className="bg-secondary p-2 rounded-md text-white hover:bg-secondary-light"
                        >
                          <span className="material-icons-outlined">check</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setMostrarNuevaCategoria(false)}
                          className="bg-gray-100 p-2 rounded-md text-gray-600 hover:bg-gray-200"
                        >
                          <span className="material-icons-outlined">close</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="destacado"
                    name="destacado"
                    checked={formData.destacado}
                    onChange={handleChange}
                    className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                  />
                  <label htmlFor="destacado" className="ml-2 block text-sm text-gray-700">
                    Destacar en la galería
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
                    Tamaño recomendado: 1200x800px
                  </p>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => router.push('/admin/galeria')}
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