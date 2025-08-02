// src/app/api/musica/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener todas las canciones
export async function GET() {
  try {
    const result = await db.query(`
      SELECT m.*, g.nombre as genero_nombre
      FROM musica m
      LEFT JOIN generos g ON m.genero_id = g.id
      ORDER BY m.orden ASC NULLS LAST, m.fecha_creacion DESC
    `);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error al obtener música:', error);
    return NextResponse.json(
      { error: 'Error al obtener la música' },
      { status: 500 }
    );
  }
}

// POST - Crear una nueva canción
export async function POST(request: NextRequest) {
  try {
    const { titulo, artista, archivo, imagen_cover, genero_id, destacado, reproducible_web, orden } = await request.json();
    
    const result = await db.query(
      `INSERT INTO musica 
       (titulo, artista, archivo, imagen_cover, genero_id, destacado, reproducible_web, orden) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [titulo, artista, archivo, imagen_cover, genero_id, destacado ?? false, reproducible_web ?? true, orden]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error al crear canción:', error);
    return NextResponse.json(
      { error: 'Error al crear la canción' },
      { status: 500 }
    );
  }
}