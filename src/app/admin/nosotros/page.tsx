// src/app/admin/nosotros/page.tsx
'use client'
import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';

interface Caracteristica {
  id?: number;
  titulo: string;
  icono: string;
  orden: number;
}

interface Estadistica {
  id?: number;
  valor: string;
  descripcion: string;
  orden: number;
}

interface SobreNosotrosData {
  id?: number;
  titulo: string;
  descripcion: string;
  imagen: string;
  caracteristicas: Caracteristica[];
  estadisticas: Estadistica[];
}

export default function SobreNosotrosAdmin() {
  const [formData, setFormData] = useState<SobreNosotrosData>({
    titulo: '',
    descripcion: '',
    imagen: '',
    caracteristicas: [],
    estadisticas: []
  });
  
  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cargar datos existentes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/nosotros', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al cargar la información');
        }
        
        const data = await response.json();
        
        if (data && data.id) {
          setFormData({
            id: data.id,
            titulo: data.titulo || '',
            descripcion: data.descripcion || '',
            imagen: data.imagen || '',
            caracteristicas: data.caracteristicas || [],
            estadisticas: data.estadisticas || []
          });
          
          // Establecer la imagen actual como preview
          if (data.imagen) {
            setPreview(data.imagen);
          }
        } else {
          // Inicializar con datos vacíos y características/estadísticas por defecto
          setFormData({
            titulo: '',
            descripcion: '',
            imagen: '',
            caracteristicas: [
              { titulo: '', icono: 'check_circle', orden: 1 }
            ],
            estadisticas: [
              { valor: '0', descripcion: 'Estadística', orden: 1 }
            ]
          });
        }
      } catch (error) {
        console.error('Error fetching about us data:', error);
        setError('No se pudo cargar la información. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setImagen(file);
      setPreview(fileUrl);
    }
  };

  const handleCaracteristicaChange = (index: number, field: string, value: string) => {
    const newCaracteristicas = [...formData.caracteristicas];
    newCaracteristicas[index] = {
      ...newCaracteristicas[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      caracteristicas: newCaracteristicas
    }));
  };

  const addCaracteristica = () => {
    const newCaract: Caracteristica = {
      titulo: '',
      icono: 'check_circle',
      orden: formData.caracteristicas.length + 1
    };
    setFormData(prev => ({
      ...prev,
      caracteristicas: [...prev.caracteristicas, newCaract]
    }));
  };

  const removeCaracteristica = (index: number) => {
    const newCaracteristicas = formData.caracteristicas.filter((_, i) => i !== index);
    // Actualizar órdenes
    const updatedCaracteristicas = newCaracteristicas.map((c, i) => ({
      ...c,
      orden: i + 1
    }));
    setFormData(prev => ({
      ...prev,
      caracteristicas: updatedCaracteristicas
    }));
  };

  const handleEstadisticaChange = (index: number, field: string, value: string) => {
    const newEstadisticas = [...formData.estadisticas];
    newEstadisticas[index] = {
      ...newEstadisticas[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      estadisticas: newEstadisticas
    }));
  };

  const addEstadistica = () => {
    const newStat: Estadistica = {
      valor: '0',
      descripcion: 'Nueva estadística',
      orden: formData.estadisticas.length + 1
    };
    setFormData(prev => ({
      ...prev,
      estadisticas: [...prev.estadisticas, newStat]
    }));
  };

  const removeEstadistica = (index: number) => {
    const newEstadisticas = formData.estadisticas.filter((_, i) => i !== index);
    // Actualizar órdenes
    const updatedEstadisticas = newEstadisticas.map((s, i) => ({
      ...s,
      orden: i + 1
    }));
    setFormData(prev => ({
      ...prev,
      estadisticas: updatedEstadisticas
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      // Recuperar el token de autenticación
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No hay sesión activa. Por favor, inicie sesión nuevamente.');
      }
      
      let imagenUrl = formData.imagen;
      
      // Subir nueva imagen si se ha seleccionado
      if (imagen) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', imagen);
        formDataUpload.append('folder', 'nosotros');
        formDataUpload.append('quality', '85'); // Calidad WebP 85%
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formDataUpload
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Error al subir la imagen');
        }
        
        const uploadData = await uploadResponse.json();
        imagenUrl = uploadData.url;
        
        console.log("Imagen convertida a WebP y subida:", {
          url: uploadData.url,
          format: uploadData.format || 'webp'
        });
      }
      
      // Guardar toda la información
      const response = await fetch('/api/nosotros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          imagen: imagenUrl
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al guardar la información');
      }
      
      // Actualizar la URL de la imagen en el estado si se subió una nueva
      if (imagen) {
        setFormData(prev => ({
          ...prev,
          imagen: imagenUrl
        }));
      }
      
      setSuccess('Información guardada correctamente');
      
      // Recargar la página después de un breve retraso para ver los cambios
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error: any) {
      console.error('Error al guardar información:', error);
      setError(error.message || 'Error al guardar la información');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Sección Sobre Nosotros</h1>
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
          <form onSubmit={handleSubmit}>
            {/* Información principal */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Información Principal</h2>
                
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
                  
                  <div className="md:col-span-2">
                    <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      id="descripcion"
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleChange}
                      rows={5}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                      required
                    />
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
                        {preview ? "Cambiar imagen" : "Seleccionar imagen"}
                      </label>
                      {preview && (
                        <div className="h-20 w-32 bg-gray-200 rounded overflow-hidden">
                          <img
                            src={preview}
                            alt="Vista previa"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Tamaño recomendado: 800x600px (se convertirá a WebP para mejor rendimiento)
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Características */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Características</h2>
                  <button
                    type="button"
                    onClick={addCaracteristica}
                    className="bg-secondary text-white px-3 py-1 rounded-md text-sm hover:bg-secondary-light transition-colors"
                  >
                    Agregar
                  </button>
                </div>
                
                {formData.caracteristicas.length === 0 ? (
                  <p className="text-gray-500">No hay características agregadas.</p>
                ) : (
                  <div className="space-y-4">
                    {formData.caracteristicas.map((caract, index) => (
                      <div key={caract.id || index} className="flex items-start space-x-4 border border-gray-200 p-4 rounded-lg">
                        <div className="flex-1">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor={`caract-titulo-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                                Título
                              </label>
                              <input
                                type="text"
                                id={`caract-titulo-${index}`}
                                value={caract.titulo}
                                onChange={(e) => handleCaracteristicaChange(index, 'titulo', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                                required
                              />
                            </div>
                            <div>
                              <label htmlFor={`caract-icono-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                                Icono
                              </label>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  id={`caract-icono-${index}`}
                                  value={caract.icono}
                                  onChange={(e) => handleCaracteristicaChange(index, 'icono', e.target.value)}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                                  placeholder="check_circle"
                                />
                                <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                  <span className="material-icons-outlined text-gray-600">
                                    {caract.icono || 'help_outline'}
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                Nombre del icono de Material Icons
                              </p>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCaracteristica(index)}
                          className="flex-shrink-0 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <span className="material-icons-outlined">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Estadísticas */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Estadísticas</h2>
                  <button
                    type="button"
                    onClick={addEstadistica}
                    className="bg-secondary text-white px-3 py-1 rounded-md text-sm hover:bg-secondary-light transition-colors"
                  >
                    Agregar
                  </button>
                </div>
                
                {formData.estadisticas.length === 0 ? (
                  <p className="text-gray-500">No hay estadísticas agregadas.</p>
                ) : (
                  <div className="space-y-4">
                    {formData.estadisticas.map((stat, index) => (
                      <div key={stat.id || index} className="flex items-start space-x-4 border border-gray-200 p-4 rounded-lg">
                        <div className="flex-1">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor={`stat-valor-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                                Valor
                              </label>
                              <input
                                type="text"
                                id={`stat-valor-${index}`}
                                value={stat.valor}
                                onChange={(e) => handleEstadisticaChange(index, 'valor', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                                required
                              />
                            </div>
                            <div>
                              <label htmlFor={`stat-descripcion-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                                Descripción
                              </label>
                              <input
                                type="text"
                                id={`stat-descripcion-${index}`}
                                value={stat.descripcion}
                                onChange={(e) => handleEstadisticaChange(index, 'descripcion', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                                required
                              />
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeEstadistica(index)}
                          className="flex-shrink-0 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <span className="material-icons-outlined">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-secondary text-white px-6 py-2 rounded-md hover:bg-secondary-light transition-colors flex items-center"
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
        )}
      </div>
    </AdminLayout>
  );
}