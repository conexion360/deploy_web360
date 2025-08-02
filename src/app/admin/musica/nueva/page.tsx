// src/app/admin/musica/nueva/page.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';

interface Genero {
  id: number;
  nombre: string;
}

export default function NuevaMusica() {
  const [formData, setFormData] = useState({
    titulo: '',
    artista: '',
    genero_id: '',
    orden: '',
    destacado: false,
    reproducible_web: true
  });
  
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [previewCover, setPreviewCover] = useState<string | null>(null);
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();

  // Cargar géneros disponibles
  useEffect(() => {
    const fetchGeneros = async () => {
      try {
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
      }
    };
    
    fetchGeneros();
  }, []);

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

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setCoverImage(file);
      setPreviewCover(fileUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!audioFile) {
      setError('Debes subir un archivo de audio');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setUploadProgress(0);
      
      let coverUrl = null;
      
      // Subir imagen de portada si existe
      if (coverImage) {
        setUploadProgress(10);
        const formDataCover = new FormData();
        formDataCover.append('file', coverImage);
        formDataCover.append('folder', 'covers');
        
        const uploadCoverResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: formDataCover
        });
        
        if (!uploadCoverResponse.ok) {
          throw new Error('Error al subir la imagen de portada');
        }
        
        const coverData = await uploadCoverResponse.json();
        coverUrl = coverData.url;
        setUploadProgress(40);
      }
      
      // Subir archivo de audio
      const formDataAudio = new FormData();
      formDataAudio.append('file', audioFile);
      formDataAudio.append('folder', 'musica');
      
      setUploadProgress(50);
      const uploadAudioResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formDataAudio
      });
      
      if (!uploadAudioResponse.ok) {
        throw new Error('Error al subir el archivo de audio');
      }
      
      const audioData = await uploadAudioResponse.json();
      setUploadProgress(80);
      
      // Crear la canción en la API
      const response = await fetch('/api/musica', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          ...formData,
          archivo: audioData.url,
          imagen_cover: coverUrl,
          genero_id: formData.genero_id ? parseInt(formData.genero_id) : null,
          orden: formData.orden ? parseInt(formData.orden) : null
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al crear la canción');
      }
      
      setUploadProgress(100);
      
      // Redireccionar a la página de administración de música
      router.push('/admin/musica');
      
    } catch (error: any) {
      setError(error.message || 'Error al subir la música');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Subir Nueva Canción</h1>
          <button
            onClick={() => router.push('/admin/musica')}
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

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
                  Título de la canción *
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
                <label htmlFor="artista" className="block text-sm font-medium text-gray-700 mb-1">
                  Artista
                </label>
                <input
                  type="text"
                  id="artista"
                  name="artista"
                  value={formData.artista}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                />
              </div>
              
              <div>
                <label htmlFor="genero_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Género
                </label>
                <select
                  id="genero_id"
                  name="genero_id"
                  value={formData.genero_id}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                >
                  <option value="">Seleccionar género</option>
                  {generos.map(genero => (
                    <option key={genero.id} value={genero.id}>
                      {genero.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="orden" className="block text-sm font-medium text-gray-700 mb-1">
                  Orden (opcional)
                </label>
                <input
                  type="number"
                  id="orden"
                  name="orden"
                  min="1"
                  value={formData.orden}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                />
              </div>
              
              <div>
                <label htmlFor="audioFile" className="block text-sm font-medium text-gray-700 mb-1">
                  Archivo de audio MP3 *
                </label>
                <div className="flex items-center">
                  <input
                    type="file"
                    id="audioFile"
                    accept="audio/mp3,audio/mpeg"
                    onChange={handleAudioChange}
                    className="hidden"
                    required
                  />
                  <label
                    htmlFor="audioFile"
                    className="bg-gray-100 border border-gray-300 rounded-md px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors inline-block"
                  >
                    Seleccionar archivo
                  </label>
                  {audioFile && (
                    <span className="ml-3 text-sm text-gray-600">
                      {audioFile.name}
                    </span>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-1">
                  Imagen de portada (opcional)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    id="coverImage"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="coverImage"
                    className="bg-gray-100 border border-gray-300 rounded-md px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    Seleccionar imagen
                  </label>
                  {previewCover && (
                    <div className="h-16 w-16 bg-gray-200 rounded overflow-hidden">
                      <img
                        src={previewCover}
                        alt="Vista previa"
                        className="w-full h-full object-cover"
                      />
                    </div>
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
                  Destacar en la página principal
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="reproducible_web"
                  name="reproducible_web"
                  checked={formData.reproducible_web}
                  onChange={handleChange}
                  className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                />
                <label htmlFor="reproducible_web" className="ml-2 block text-sm text-gray-700">
                  Permitir reproducción en la web
                </label>
              </div>
            </div>
            
            {loading && (
              <div className="mt-6">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-secondary h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {uploadProgress < 100 ? 'Subiendo archivos...' : 'Procesando...'}
                </p>
              </div>
            )}
            
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => router.push('/admin/musica')}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-4 hover:bg-gray-300 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary-light transition-colors flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Subiendo...
                  </>
                ) : (
                  'Subir canción'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}