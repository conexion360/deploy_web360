// src/app/api/hero/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener todos los slides
export async function GET() {
  try {
    const result = await db.query(
      'SELECT * FROM hero_slides ORDER BY orden ASC'
    );
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error al obtener hero slides:', error);
    return NextResponse.json(
      { error: 'Error al obtener los slides' },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo slide
export async function POST(request: NextRequest) {
  try {
    const { titulo, descripcion, imagen_desktop, imagen_mobile, orden, activo } = await request.json();
    
    const result = await db.query(
      `INSERT INTO hero_slides 
       (titulo, descripcion, imagen_desktop, imagen_mobile, orden, activo) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [titulo, descripcion, imagen_desktop, imagen_mobile, orden, activo ?? true]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error al crear hero slide:', error);
    return NextResponse.json(
      { error: 'Error al crear el slide' },
      { status: 500 }
    );
  }
}