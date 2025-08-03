// src/app/api/generos/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener un género por ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Asegurar que params sea resuelto si es una promesa
    const params = context.params instanceof Promise ? await context.params : context.params;
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }
    
    const result = await db.query(
      'SELECT * FROM generos WHERE id = $1',
      [id]
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
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Asegurar que params sea resuelto si es una promesa
    const params = context.params instanceof Promise ? await context.params : context.params;
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
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
      [nombre, descripcion, imagen, icono, orden, activo, id]
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
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Asegurar que params sea resuelto si es una promesa
    const params = context.params instanceof Promise ? await context.params : context.params;
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }
    
    // Primero verificar si hay música que use este género
    const checkResult = await db.query(
      'SELECT COUNT(*) FROM musica WHERE genero_id = $1',
      [id]
    );
    
    if (parseInt(checkResult.rows[0].count) > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar este género porque está siendo utilizado por canciones' },
        { status: 400 }
      );
    }
    
    const result = await db.query(
      'DELETE FROM generos WHERE id = $1 RETURNING id',
      [id]
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