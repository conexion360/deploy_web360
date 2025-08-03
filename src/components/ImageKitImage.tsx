// src/components/ImageKitImage.tsx
'use client'
import React from 'react';
import { IKImage } from 'imagekitio-react';

interface ImageKitImageProps {
  path?: string;
  src?: string;
  alt: string;
  transformation?: Array<{[key: string]: string | number}>;
  loading?: 'lazy' | 'eager';
  className?: string;
  width?: number;
  height?: number;
  lqip?: { active: boolean; quality?: number };
}

const ImageKitImage: React.FC<ImageKitImageProps> = ({
  path,
  src,
  alt,
  transformation,
  loading = 'lazy',
  className = '',
  width,
  height,
  lqip = { active: true, quality: 10 }
}) => {
  // Si tenemos una URL completa, extraer el path
  const imagePath = src ? src.replace('https://ik.imagekit.io/qpdyvnppk', '') : path;

  // Crear un objeto de props para evitar el error de tipos
  const imageProps: any = {
    path: imagePath,
    alt: alt,
    transformation: transformation,
    className: className,
    width: width,
    height: height,
    lqip: lqip
  };

  // Solo agregar loading si es 'lazy' (el valor por defecto de IKImage)
  if (loading === 'lazy') {
    imageProps.loading = 'lazy';
  }

  return <IKImage {...imageProps} />;
};

export default ImageKitImage;