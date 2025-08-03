// src/components/admin/BulkUploadGallery.tsx
'use client'
import React, { useState, useRef } from 'react';

interface UploadStatus {
  fileName: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  id?: number;
}

const BulkUploadGallery: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [categoria, setCategoria] = useState<string>('');
  const [nuevaCategoria, setNuevaCategoria] = useState<string>('');
  const [showNewCategory, setShowNewCategory] = useState<boolean>(false);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [destacar, setDestacar] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar categorías existentes al montar el componente
  React.useEffect(() => {
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Convertir FileList a array
      const fileArray = Array.from(e.target.files);
      setFiles(fileArray);
      
      // Inicializar estado de carga para cada archivo
      setUploadStatus(fileArray.map(file => ({
        fileName: file.name,
        status: 'pending',
        progress: 0
      })));
    }
  };

  const handleAddCategory = () => {
    if (nuevaCategoria.trim() && !categorias.includes(nuevaCategoria.trim())) {
      setCategorias([...categorias, nuevaCategoria.trim()]);
      setCategoria(nuevaCategoria.trim());
      setNuevaCategoria('');
      setShowNewCategory(false);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Por favor, selecciona al menos un archivo');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      // Crear una copia del estado de carga para actualizarlo
      // Cambiado de 'let' a 'const' para evitar advertencia de ESLint
      const currentStatus = [...uploadStatus];
      
      // Subir cada archivo uno por uno
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Actualizar estado a "uploading"
        currentStatus[i] = { ...currentStatus[i], status: 'uploading', progress: 10 };
        setUploadStatus([...currentStatus]);
        
        try {
          // 1. Primero subir la imagen
          const formDataUpload = new FormData();
          formDataUpload.append('file', file);
          formDataUpload.append('folder', 'galeria');
          
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: formDataUpload
          });
          
          if (!uploadResponse.ok) {
            throw new Error(`Error al subir la imagen: ${file.name}`);
          }
          
          const uploadData = await uploadResponse.json();
          
          // Actualizar progreso
          currentStatus[i] = { ...currentStatus[i], progress: 50 };
          setUploadStatus([...currentStatus]);
          
          // 2. Crear el registro en la galería
          // Extraer nombre del archivo sin extensión para usarlo como título
          const fileName = file.name.split('.')[0];
          const fileTitle = fileName.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          
          const galeriaResponse = await fetch('/api/galeria', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({
              titulo: fileTitle,
              descripcion: '',
              imagen: uploadData.url,
              thumbnail: uploadData.url, // Usar la misma imagen como miniatura
              orden: i + 1, // Asignar orden secuencial
              categoria: categoria,
              destacado: destacar
            })
          });
          
          if (!galeriaResponse.ok) {
            throw new Error(`Error al guardar en la galería: ${file.name}`);
          }
          
          const galeriaData = await galeriaResponse.json();
          
          // Actualizar estado a "success"
          currentStatus[i] = { 
            ...currentStatus[i], 
            status: 'success', 
            progress: 100,
            id: galeriaData.id
          };
          setUploadStatus([...currentStatus]);
          
        } catch (error: any) {
          // Actualizar estado a "error" para este archivo
          currentStatus[i] = { 
            ...currentStatus[i], 
            status: 'error', 
            progress: 100,
            error: error.message 
          };
          setUploadStatus([...currentStatus]);
        }
      }
      
      // Verificar si todos se subieron correctamente
      const allSuccess = currentStatus.every(status => status.status === 'success');
      const totalSuccess = currentStatus.filter(status => status.status === 'success').length;
      
      if (allSuccess) {
        setSuccess(`Se han subido correctamente ${totalSuccess} imágenes a la galería.`);
      } else {
        setSuccess(`Se han subido ${totalSuccess} de ${files.length} imágenes.`);
        if (totalSuccess < files.length) {
          setError('Algunas imágenes no se pudieron subir. Revisa los detalles.');
        }
      }
      
    } catch (error: any) {
      setError(`Error general: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const clearFiles = () => {
    setFiles([]);
    setUploadStatus([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Carga por Lote de Imágenes</h2>
      
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
      
      <div className="space-y-6">
        {/* Selección de archivos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Imágenes
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-secondary hover:text-secondary-light">
                  <span>Subir archivos</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    ref={fileInputRef}
                  />
                </label>
                <p className="pl-1">o arrastra y suelta</p>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF hasta 10MB
              </p>
            </div>
          </div>
        </div>
        
        {/* Lista de archivos seleccionados */}
        {files.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Archivos seleccionados ({files.length})
            </h3>
            <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
              {uploadStatus.map((status, index) => (
                <li key={index} className="py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm truncate max-w-xs">{status.fileName}</span>
                    <div className="flex items-center">
                      {status.status === 'pending' && (
                        <span className="text-xs text-gray-500">Pendiente</span>
                      )}
                      {status.status === 'uploading' && (
                        <div className="w-20 bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-secondary h-2.5 rounded-full" 
                            style={{ width: `${status.progress}%` }}
                          ></div>
                        </div>
                      )}
                      {status.status === 'success' && (
                        <span className="text-xs text-green-600 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Subido
                        </span>
                      )}
                      {status.status === 'error' && (
                        <span className="text-xs text-red-600 flex items-center" title={status.error}>
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          Error
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-2">
              <button
                type="button"
                onClick={clearFiles}
                className="text-sm text-red-600 hover:text-red-800"
                disabled={uploading}
              >
                Limpiar selección
              </button>
            </div>
          </div>
        )}
        
        {/* Opciones de carga */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Opciones comunes para todas las imágenes
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              
              {!showNewCategory ? (
                <div className="flex items-center space-x-2">
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm"
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
                    onClick={() => setShowNewCategory(true)}
                    className="p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={nuevaCategoria}
                    onChange={(e) => setNuevaCategoria(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm"
                    placeholder="Nueva categoría"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="p-2 rounded-md bg-secondary text-white hover:bg-secondary-light"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewCategory(false)}
                    className="p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            
            {/* Destacar */}
            <div className="flex items-center h-full">
              <input
                id="destacar"
                type="checkbox"
                checked={destacar}
                onChange={(e) => setDestacar(e.target.checked)}
                className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
              />
              <label htmlFor="destacar" className="ml-2 block text-sm text-gray-700">
                Destacar en la galería
              </label>
            </div>
          </div>
        </div>
        
        {/* Botones de acción */}
        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-4 hover:bg-gray-300 transition-colors"
            disabled={uploading}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="bg-secondary text-white px-6 py-2 rounded-md hover:bg-secondary-light transition-colors flex items-center"
          >
            {uploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Subiendo...
              </>
            ) : (
              'Subir Imágenes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadGallery;