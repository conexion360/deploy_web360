// src/app/api/generos/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener un género por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }
    
    const result = await db.query(
      'SELECT * FROM generos WHERE id = $1',
      [numericId]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Género no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener género:', error);
    return NextResponse.json(
      { error: 'Error al obtener el género' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un género
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }
    
    const { nombre, descripcion, imagen, icono, orden, activo } = await request.json();
    
    const result = await db.query(
      `UPDATE generos 
       SET nombre = $1, descripcion = $2, imagen = $3, icono = $4, 
           orden = $5, activo = $6, fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [nombre, descripcion, imagen, icono, orden, activo, numericId]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Género no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar género:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el género' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un género
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }
    
    // Primero verificar si hay música que use este género
    const checkResult = await db.query(
      'SELECT COUNT(*) FROM musica WHERE genero_id = $1',
      [numericId]
    );
    
    if (parseInt(checkResult.rows[0].count) > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar este género porque está siendo utilizado por canciones' },
        { status: 400 }
      );
    }
    
    const result = await db.query(
      'DELETE FROM generos WHERE id = $1 RETURNING id',
      [numericId]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Género no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Género eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar género:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el género' },
      { status: 500 }
    );
  }
}