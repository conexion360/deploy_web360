// src/app/api/hero/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener un slide por ID
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
      'SELECT * FROM hero_slides WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Slide no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener hero slide:', error);
    return NextResponse.json(
      { error: 'Error al obtener el slide' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un slide
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
    
    const { titulo, descripcion, imagen_desktop, imagen_mobile, orden, activo } = await request.json();
    
    const result = await db.query(
      `UPDATE hero_slides 
       SET titulo = $1, descripcion = $2, imagen_desktop = $3, imagen_mobile = $4, 
           orden = $5, activo = $6, fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [titulo, descripcion, imagen_desktop, imagen_mobile, orden, activo, id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Slide no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar hero slide:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el slide' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un slide
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
      'DELETE FROM hero_slides WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Slide no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Slide eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar hero slide:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el slide' },
      { status: 500 }
    );
  }
}