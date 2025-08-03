// src/lib/imagekit.ts
import ImageKit from 'imagekit';

// Verificar que las variables de entorno estén definidas
if (!process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || 
    !process.env.IMAGEKIT_PRIVATE_KEY || 
    !process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT) {
  console.error('Las variables de entorno de ImageKit no están configuradas correctamente');
}

// Configuración del servidor de ImageKit
export const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || 'public_nJIM9VeYDWasBIUi3ixlGpRzZz4=',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'private_OiWhfp78ou3Prah0GLZ67xoLE98=',
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/qpdyvnppk'
});

// Función helper para generar un nombre único de archivo
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const nameWithoutExt = originalName.split('.').slice(0, -1).join('.');
  const cleanName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  
  return `${cleanName}-${timestamp}-${randomString}.${extension}`;
}

// Función para determinar la carpeta según el tipo de contenido
export function getFolderByType(type: string): string {
  const folders: { [key: string]: string } = {
    'hero': 'hero-slides',
    'galeria': 'gallery',
    'nosotros': 'about',
    'generos': 'genres',
    'covers': 'music-covers',
    'musica': 'music-files',
    'site': 'site-assets'
  };
  
  return folders[type] || 'uploads';
}

// Función para generar transformaciones de ImageKit
export function getImageTransformation(type: string, options?: any) {
  const transformations: { [key: string]: any } = {
    'hero-desktop': [
      {
        width: '1920',
        height: '1080',
        quality: '85',
        format: 'webp',
        focus: 'auto'
      }
    ],
    'hero-mobile': [
      {
        width: '768',
        height: '1024',
        quality: '85',
        format: 'webp',
        focus: 'auto'
      }
    ],
    'gallery-thumb': [
      {
        width: '400',
        height: '300',
        quality: '80',
        format: 'webp',
        crop: 'at_max',
        focus: 'auto'
      }
    ],
    'gallery-full': [
      {
        width: '1200',
        height: '800',
        quality: '90',
        format: 'webp',
        crop: 'at_max'
      }
    ],
    'genre-card': [
      {
        width: '600',
        height: '400',
        quality: '85',
        format: 'webp',
        crop: 'maintain_ratio'
      }
    ],
    'music-cover': [
      {
        width: '300',
        height: '300',
        quality: '80',
        format: 'webp',
        crop: 'at_max'
      }
    ]
  };

  return transformations[type] || [];
}

// Función para generar URL con transformación WebP
export function getOptimizedImageUrl(url: string, transformations?: string): string {
  if (!url || !url.includes('ik.imagekit.io')) {
    return url;
  }

  // Extraer las partes de la URL
  const urlParts = url.split('/');
  const baseUrl = urlParts.slice(0, 3).join('/'); // https://ik.imagekit.io
  const endpoint = urlParts[3]; // qpdyvnppk
  const pathParts = urlParts.slice(4); // resto del path
  
  // Encontrar dónde insertar las transformaciones
  let folderPath = '';
  let fileName = '';
  
  // El último elemento es el archivo
  fileName = pathParts.pop() || '';
  // El resto es la carpeta
  folderPath = pathParts.join('/');
  
  // Construir las transformaciones
  const defaultTransform = 'f-webp,q-85';
  const finalTransformations = transformations 
    ? `${defaultTransform},${transformations}`
    : defaultTransform;
  
  // Reconstruir la URL con transformaciones
  const optimizedUrl = folderPath
    ? `${baseUrl}/${endpoint}/${folderPath}/tr:${finalTransformations}/${fileName}`
    : `${baseUrl}/${endpoint}/tr:${finalTransformations}/${fileName}`;
  
  return optimizedUrl;
}

// Función para extraer el fileId de una URL de ImageKit
export function extractFileIdFromUrl(url: string): string | null {
  try {
    // La URL típica de ImageKit es: https://ik.imagekit.io/qpdyvnppk/folder/filename_fileId.extension
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1];
    
    // El fileId generalmente está al final del nombre del archivo antes de la extensión
    const match = filename.match(/_([a-zA-Z0-9]+)\./);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extrayendo fileId:', error);
    return null;
  }
}