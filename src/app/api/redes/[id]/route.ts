// src/app/api/redes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener una red social por ID
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
      'SELECT * FROM redes_sociales WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Red social no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener red social:', error);
    return NextResponse.json(
      { error: 'Error al obtener la red social' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar una red social
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
    
    const { nombre, url, icono, username, color, orden, activo } = await request.json();
    
    const result = await db.query(
      `UPDATE redes_sociales 
       SET nombre = $1, url = $2, icono = $3, username = $4, 
           color = $5, orden = $6, activo = $7, fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [nombre, url, icono, username, color, orden, activo, id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Red social no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar red social:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la red social' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar una red social
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
    
    const result = await db.query(
      'DELETE FROM redes_sociales WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Red social no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Red social eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar red social:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la red social' },
      { status: 500 }
    );
  }
}