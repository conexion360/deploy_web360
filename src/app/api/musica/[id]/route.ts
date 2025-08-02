// src/app/api/musica/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener una canción por ID
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
    
    const result = await db.query(`
      SELECT m.*, g.nombre as genero_nombre
      FROM musica m
      LEFT JOIN generos g ON m.genero_id = g.id
      WHERE m.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Canción no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener canción:', error);
    return NextResponse.json(
      { error: 'Error al obtener la canción' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar una canción
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
    
    const { titulo, artista, archivo, imagen_cover, genero_id, destacado, reproducible_web, orden } = await request.json();
    
    const result = await db.query(
      `UPDATE musica 
       SET titulo = $1, artista = $2, archivo = $3, imagen_cover = $4, 
           genero_id = $5, destacado = $6, reproducible_web = $7, orden = $8
       WHERE id = $9
       RETURNING *`,
      [titulo, artista, archivo, imagen_cover, genero_id, destacado, reproducible_web, orden, id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Canción no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar canción:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la canción' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar una canción
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
      'DELETE FROM musica WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Canción no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Canción eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar canción:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la canción' },
      { status: 500 }
    );
  }
}