// src/app/api/galeria/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener una imagen por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }
    
    const result = await db.query(
      'SELECT * FROM galeria WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Imagen no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener imagen de galería:', error);
    return NextResponse.json(
      { error: 'Error al obtener la imagen' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar una imagen
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }
    
    const { titulo, descripcion, imagen, thumbnail, orden, categoria, destacado } = await request.json();
    
    const result = await db.query(
      `UPDATE galeria 
       SET titulo = $1, descripcion = $2, imagen = $3, thumbnail = $4, 
           orden = $5, categoria = $6, destacado = $7, fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [titulo, descripcion, imagen, thumbnail, orden, categoria, destacado, id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Imagen no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar imagen de galería:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la imagen' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar una imagen
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }
    
    const result = await db.query(
      'DELETE FROM galeria WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Imagen no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Imagen eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar imagen de galería:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la imagen' },
      { status: 500 }
    );
  }
}