// src/app/api/galeria/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener todas las imágenes de la galería
export async function GET() {
  try {
    const result = await db.query(
      'SELECT * FROM galeria ORDER BY orden ASC'
    );
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error al obtener galería:', error);
    return NextResponse.json(
      { error: 'Error al obtener la galería' },
      { status: 500 }
    );
  }
}

// POST - Crear una nueva imagen en la galería
export async function POST(request: NextRequest) {
  try {
    const { titulo, descripcion, imagen, thumbnail, orden, categoria, destacado } = await request.json();
    
    const result = await db.query(
      `INSERT INTO galeria 
       (titulo, descripcion, imagen, thumbnail, orden, categoria, destacado) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [titulo, descripcion, imagen, thumbnail, orden, categoria, destacado ?? false]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error al crear imagen en galería:', error);
    return NextResponse.json(
      { error: 'Error al crear la imagen en la galería' },
      { status: 500 }
    );
  }
}