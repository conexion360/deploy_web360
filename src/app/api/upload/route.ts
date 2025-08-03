// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { imagekit, generateUniqueFileName, getFolderByType } from '@/lib/imagekit';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verificar la autenticación
    const auth = await verifyAuth(request);
    
    // Log para depuración
    console.log("Auth status:", auth.success ? "Autenticado" : "No autenticado");
    if (!auth.success) {
      console.log("Auth error:", auth.error);
      // En producción, descomenta la siguiente línea
      // return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    // Obtener el formulario con el archivo
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'uploads';
    
    if (!file) {
      return NextResponse.json(
        { error: 'No se ha proporcionado un archivo' },
        { status: 400 }
      );
    }
    
    // Convertir el archivo a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Generar nombre único
    const uniqueFileName = generateUniqueFileName(file.name);
    
    // Determinar la carpeta correcta en ImageKit
    const imagekitFolder = getFolderByType(folder);
    
    try {
      // Subir a ImageKit
      console.log(`Subiendo archivo a ImageKit: ${uniqueFileName} en carpeta ${imagekitFolder}`);
      
      const uploadResponse = await imagekit.upload({
        file: buffer,
        fileName: uniqueFileName,
        folder: imagekitFolder,
        useUniqueFileName: false, // Ya generamos un nombre único
        tags: [folder], // Agregar tag para facilitar búsqueda
        // Las transformaciones se aplicarán dinámicamente en las URLs, no en el upload
        overwriteFile: false,
        overwriteAITags: false,
        overwriteTags: false,
        overwriteCustomMetadata: false
      });
      
      console.log('Archivo subido exitosamente a ImageKit:', {
        url: uploadResponse.url,
        fileId: uploadResponse.fileId,
        name: uploadResponse.name
      });
      
      // Devolver respuesta exitosa
      return NextResponse.json({ 
        success: true, 
        url: uploadResponse.url,
        fileId: uploadResponse.fileId,
        filename: uploadResponse.name,
        originalFilename: file.name,
        thumbnailUrl: uploadResponse.thumbnailUrl,
        format: uploadResponse.fileType
      });
      
    } catch (uploadError: any) {
      console.error('Error al subir a ImageKit:', uploadError);
      return NextResponse.json(
        { error: 'Error al subir el archivo a ImageKit: ' + uploadError.message },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error('Error general en upload:', error);
    return NextResponse.json(
      { error: 'Error al procesar el archivo: ' + error.message },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar archivo de ImageKit
export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticación
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    const { fileId } = await request.json();
    
    if (!fileId) {
      return NextResponse.json(
        { error: 'No se proporcionó el ID del archivo' },
        { status: 400 }
      );
    }
    
    try {
      // Eliminar de ImageKit
      await imagekit.deleteFile(fileId);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Archivo eliminado correctamente' 
      });
      
    } catch (deleteError: any) {
      console.error('Error al eliminar de ImageKit:', deleteError);
      return NextResponse.json(
        { error: 'Error al eliminar el archivo de ImageKit' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error en delete:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}