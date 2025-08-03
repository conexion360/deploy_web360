// src/components/admin/ImageKitUpload.tsx
'use client'
import React, { useRef } from 'react';
import { IKUpload } from 'imagekitio-react';

interface ImageKitUploadProps {
  folder: string;
  onSuccess: (res: any) => void;
  onError: (err: any) => void;
  accept?: string;
  maxSize?: number; // en bytes
  className?: string;
  children?: React.ReactNode;
}

const ImageKitUpload: React.FC<ImageKitUploadProps> = ({
  folder,
  onSuccess,
  onError,
  accept = "image/*",
  maxSize = 10 * 1024 * 1024, // 10MB por defecto
  className = "",
  children
}) => {
  const uploadRef = useRef<any>(null);

  const handleSuccess = (res: any) => {
    console.log('Upload exitoso:', res);
    onSuccess({
      url: res.url,
      fileId: res.fileId,
      thumbnailUrl: res.thumbnailUrl,
      name: res.name,
      size: res.size,
      filePath: res.filePath,
      fileType: res.fileType,
      height: res.height,
      width: res.width
    });
  };

  const handleError = (err: any) => {
    console.error('Error en upload:', err);
    onError(err);
  };

  const validateFileSize = (file: File) => {
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      alert(`El archivo es demasiado grande. El tamaño máximo permitido es ${maxSizeMB}MB`);
      return false;
    }
    return true;
  };

  return (
    <IKUpload
      ref={uploadRef}
      folder={`/${folder}`}
      onSuccess={handleSuccess}
      onError={handleError}
      accept={accept}
      useUniqueFileName={true}
      validateFile={validateFileSize}
      className={className}
      style={{ display: 'none' }}
    />
  );
};

export default ImageKitUpload;