// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { verifyAuth } from '@/lib/auth';
import sharp from 'sharp'; // Asegúrate de instalar sharp: npm install sharp

export async function POST(request: NextRequest) {
  try {
    // Verificar la autenticación, pero hacer opcional para permitir cargas públicas si es necesario
    const auth = await verifyAuth(request);
    
    // Solo para depuración - comenta esta sección en producción
    console.log("Auth status:", auth.success ? "Autenticado" : "No autenticado");
    if (!auth.success) {
      console.log("Auth error:", auth.error);
      // Permitimos continuar aunque falle la autenticación para fines de depuración
      // En producción, descomenta la siguiente línea
      // return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    // Obtener el formulario con el archivo
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'uploads';
    
    // Opción para mantener la calidad y tamaño original
    const quality = parseInt(formData.get('quality') as string || '80');
    const width = parseInt(formData.get('width') as string || '0');
    const height = parseInt(formData.get('height') as string || '0');
    
    if (!file) {
      return NextResponse.json(
        { error: 'No se ha proporcionado un archivo' },
        { status: 400 }
      );
    }
    
    // Verificar si es una imagen
    const mimeType = file.type;
    const isImage = mimeType.startsWith('image/');
    
    // Crear la carpeta si no existe
    const uploadDir = join(process.cwd(), 'public', folder);
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }
    
    // Obtener la extensión y nombre original del archivo
    const originalFilename = file.name;
    const timestamp = Date.now();
    const filenameWithoutExt = originalFilename.split('.')[0].replace(/\s+/g, '-');
    
    // Procesar y guardar el archivo
    if (isImage && mimeType !== 'image/gif') { // No convertimos GIFs para mantener la animación
      // Convertir a WebP para imágenes
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Configurar sharp para la conversión
      let sharpInstance = sharp(buffer).webp({ quality });
      
      // Redimensionar si se especifican dimensiones
      if (width > 0 || height > 0) {
        sharpInstance = sharpInstance.resize({
          width: width || undefined,
          height: height || undefined,
          fit: 'inside',
          withoutEnlargement: true
        });
      }
      
      // Nombre del archivo WebP
      const webpFilename = `${timestamp}-${filenameWithoutExt}.webp`;
      const webpFilePath = join(uploadDir, webpFilename);
      
      // Guardar como WebP
      await sharpInstance.toFile(webpFilePath);
      
      // URL para acceder al archivo
      const fileUrl = `/${folder}/${webpFilename}`;
      
      console.log(`Imagen convertida y guardada como WebP: ${fileUrl}`);
      
      return NextResponse.json({ 
        success: true, 
        url: fileUrl,
        filename: webpFilename,
        originalFilename: originalFilename,
        format: 'webp'
      });
    } else {
      // Para archivos que no son imágenes o son GIFs, guardamos sin convertir
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Generar un nombre de archivo único
      const fileExt = originalFilename.split('.').pop() || '';
      const filename = `${timestamp}-${filenameWithoutExt}.${fileExt}`;
      
      // Ruta completa del archivo
      const filePath = join(uploadDir, filename);
      
      // Guardar el archivo original
      await writeFile(filePath, buffer);
      
      // URL para acceder al archivo
      const fileUrl = `/${folder}/${filename}`;
      
      console.log(`Archivo guardado sin conversión: ${fileUrl}`);
      
      return NextResponse.json({ 
        success: true, 
        url: fileUrl,
        filename: filename,
        originalFilename: originalFilename,
        format: fileExt
      });
    }
  } catch (error) {
    console.error('Error al subir archivo:', error);
    return NextResponse.json(
      { error: 'Error al procesar el archivo' },
      { status: 500 }
    );
  }
}