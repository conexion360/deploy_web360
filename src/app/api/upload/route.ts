// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'uploads';
    
    if (!file) {
      return NextResponse.json(
        { error: 'No se ha proporcionado un archivo' },
        { status: 400 }
      );
    }
    
    // Crear la carpeta si no existe
    const uploadDir = join(process.cwd(), 'public', folder);
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }
    
    // Generar un nombre de archivo único
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Obtener la extensión del archivo
    const originalFilename = file.name;
    const fileExt = originalFilename.split('.').pop() || '';
    
    // Generar un nombre de archivo único
    const timestamp = Date.now();
    const filename = `${timestamp}-${originalFilename.replace(/\s+/g, '-')}`;
    
    // Ruta completa del archivo
    const filePath = join(uploadDir, filename);
    
    // Guardar el archivo
    await writeFile(filePath, buffer);
    
    // URL para acceder al archivo
    const fileUrl = `/${folder}/${filename}`;
    
    return NextResponse.json({ 
      success: true, 
      url: fileUrl,
      filename: filename,
      originalFilename: originalFilename
    });
  } catch (error) {
    console.error('Error al subir archivo:', error);
    return NextResponse.json(
      { error: 'Error al procesar el archivo' },
      { status: 500 }
    );
  }
}