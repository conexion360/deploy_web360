// src/app/admin/galeria/bulk-upload/page.tsx
'use client'
import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import BulkUploadGallery from '../../../../components/admin/BulkUploadGallery';

export default function BulkUploadGalleryPage() {
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Carga Masiva de Imágenes</h1>
          <button
            onClick={() => window.history.back()}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-300 transition-colors"
          >
            <span className="material-icons-outlined">arrow_back</span>
            <span>Volver</span>
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600">
            Esta herramienta te permite subir múltiples imágenes a la galería a la vez. 
            Las imágenes serán procesadas automáticamente, utilizando el nombre del archivo como título.
          </p>
        </div>

        <BulkUploadGallery />
      </div>
    </AdminLayout>
  );
}