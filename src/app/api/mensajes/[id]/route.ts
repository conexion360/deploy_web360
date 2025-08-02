// src/app/api/mensajes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener un mensaje por ID
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
      'SELECT * FROM mensajes_contacto WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Mensaje no encontrado' },
        { status: 404 }
      );
    }
    
    // Marcar como leído si no lo estaba
    if (!result.rows[0].leido) {
      await db.query(
        'UPDATE mensajes_contacto SET leido = true, fecha_lectura = CURRENT_TIMESTAMP WHERE id = $1',
        [id]
      );
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener mensaje:', error);
    return NextResponse.json(
      { error: 'Error al obtener el mensaje' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar estado de un mensaje
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
    
    const { leido, respondido } = await request.json();
    
    const query = `
      UPDATE mensajes_contacto 
      SET leido = $1, 
          respondido = $2,
          ${leido ? 'fecha_lectura = CURRENT_TIMESTAMP,' : ''}
          ${respondido ? 'fecha_respuesta = CURRENT_TIMESTAMP' : 'fecha_respuesta = fecha_respuesta'}
      WHERE id = $3
      RETURNING *
    `;
    
    const result = await db.query(query, [
      leido !== undefined ? leido : true,
      respondido !== undefined ? respondido : false,
      id
    ]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Mensaje no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar mensaje:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el mensaje' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un mensaje
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
      'DELETE FROM mensajes_contacto WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Mensaje no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Mensaje eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar mensaje:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el mensaje' },
      { status: 500 }
    );
  }
}