// src/app/admin/configuracion/page.tsx
'use client'
import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';

interface Configuracion {
  id?: number;
  nombre_sitio: string;
  logo: string | null;
  favicon: string | null;
  email_contacto: string | null;
  telefono: string | null;
  direccion: string | null;
  footer_texto: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  youtube: string | null;
}

export default function ConfiguracionAdmin() {
  const [formData, setFormData] = useState<Configuracion>({
    nombre_sitio: '',
    logo: null,
    favicon: null,
    email_contacto: null,
    telefono: null,
    direccion: null,
    footer_texto: null,
    facebook: null,
    instagram: null,
    tiktok: null,
    youtube: null
  });
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [previewFavicon, setPreviewFavicon] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cargar la configuración actual
  useEffect(() => {
    const fetchConfiguracion = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/configuracion', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al cargar la configuración');
        }
        
        const data = await response.json();
        
        if (data && data.id) {
          setFormData(data);
          
          // Establecer previsualizaciones si hay imágenes
          if (data.logo) {
            setPreviewLogo(data.logo);
          }
          
          if (data.favicon) {
            setPreviewFavicon(data.favicon);
          }
        }
      } catch (error) {
        console.error('Error fetching configuration:', error);
        setError('No se pudo cargar la configuración. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchConfiguracion();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setLogoFile(file);
      setPreviewLogo(fileUrl);
    }
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setFaviconFile(file);
      setPreviewFavicon(fileUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      // Objeto que se enviará a la API
      const updateData = { ...formData };
      
      // Subir logo si se ha seleccionado
      if (logoFile) {
        const formDataLogo = new FormData();
        formDataLogo.append('file', logoFile);
        formDataLogo.append('folder', 'site');
        
        const uploadLogoResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: formDataLogo
        });
        
        if (!uploadLogoResponse.ok) {
          throw new Error('Error al subir el logo');
        }
        
        const logoData = await uploadLogoResponse.json();
        updateData.logo = logoData.url;
      }
      
      // Subir favicon si se ha seleccionado
      if (faviconFile) {
        const formDataFavicon = new FormData();
        formDataFavicon.append('file', faviconFile);
        formDataFavicon.append('folder', 'site');
        
        const uploadFaviconResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: formDataFavicon
        });
        
        if (!uploadFaviconResponse.ok) {
          throw new Error('Error al subir el favicon');
        }
        
        const faviconData = await uploadFaviconResponse.json();
        updateData.favicon = faviconData.url;
      }
      
      // Actualizar la configuración
      const response = await fetch('/api/configuracion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        throw new Error('Error al guardar la configuración');
      }
      
      const data = await response.json();
      setFormData(data);
      
      setSuccess('Configuración guardada correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Configuración General</h1>
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
            {/* Información General */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Información General</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="nombre_sitio" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Sitio
                    </label>
                    <input
                      type="text"
                      id="nombre_sitio"
                      name="nombre_sitio"
                      value={formData.nombre_sitio}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email_contacto" className="block text-sm font-medium text-gray-700 mb-1">
                      Email de Contacto
                    </label>
                    <input
                      type="email"
                      id="email_contacto"
                      name="email_contacto"
                      value={formData.email_contacto || ''}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="text"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono || ''}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección
                    </label>
                    <textarea
                      id="direccion"
                      name="direccion"
                      value={formData.direccion || ''}
                      onChange={handleChange}
                      rows={2}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="footer_texto" className="block text-sm font-medium text-gray-700 mb-1">
                      Texto del Footer
                    </label>
                    <textarea
                      id="footer_texto"
                      name="footer_texto"
                      value={formData.footer_texto || ''}
                      onChange={handleChange}
                      rows={2}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Imágenes */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Imágenes</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">
                      Logo del Sitio
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        id="logo"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="logo"
                        className="bg-gray-100 border border-gray-300 rounded-md px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors"
                      >
                        Seleccionar logo
                      </label>
                      {previewLogo && (
                        <div className="h-16 w-32 bg-gray-200 rounded overflow-hidden">
                          <img
                            src={previewLogo}
                            alt="Vista previa del logo"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Tamaño recomendado: 600x200px
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="favicon" className="block text-sm font-medium text-gray-700 mb-1">
                      Favicon
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        id="favicon"
                        accept="image/*"
                        onChange={handleFaviconChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="favicon"
                        className="bg-gray-100 border border-gray-300 rounded-md px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors"
                      >
                        Seleccionar favicon
                      </label>
                      {previewFavicon && (
                        <div className="h-12 w-12 bg-gray-200 rounded overflow-hidden">
                          <img
                            src={previewFavicon}
                            alt="Vista previa del favicon"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Tamaño recomendado: 32x32px o 64x64px
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Redes Sociales */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Enlaces a Redes Sociales</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-1">
                      Facebook
                    </label>
                    <input
                      type="url"
                      id="facebook"
                      name="facebook"
                      value={formData.facebook || ''}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                      placeholder="https://www.facebook.com/conexion360"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                      Instagram
                    </label>
                    <input
                      type="url"
                      id="instagram"
                      name="instagram"
                      value={formData.instagram || ''}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                      placeholder="https://www.instagram.com/conexion360"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="tiktok" className="block text-sm font-medium text-gray-700 mb-1">
                      TikTok
                    </label>
                    <input
                      type="url"
                      id="tiktok"
                      name="tiktok"
                      value={formData.tiktok || ''}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                      placeholder="https://www.tiktok.com/@conexion360"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="youtube" className="block text-sm font-medium text-gray-700 mb-1">
                      YouTube
                    </label>
                    <input
                      type="url"
                      id="youtube"
                      name="youtube"
                      value={formData.youtube || ''}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                      placeholder="https://www.youtube.com/c/conexion360"
                    />
                  </div>
                </div>
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