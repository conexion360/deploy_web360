// src/app/api/generos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener todos los géneros
export async function GET() {
  try {
    const result = await db.query(
      'SELECT * FROM generos ORDER BY orden ASC'
    );
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error al obtener géneros:', error);
    return NextResponse.json(
      { error: 'Error al obtener los géneros' },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo género
export async function POST(request: NextRequest) {
  try {
    const { nombre, descripcion, imagen, icono, orden, activo } = await request.json();
    
    const result = await db.query(
      `INSERT INTO generos 
       (nombre, descripcion, imagen, icono, orden, activo) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [nombre, descripcion, imagen, icono, orden, activo ?? true]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error al crear género:', error);
    return NextResponse.json(
      { error: 'Error al crear el género' },
      { status: 500 }
    );
  }
}