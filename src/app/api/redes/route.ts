// src/app/api/redes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener todas las redes sociales
export async function GET() {
  try {
    const result = await db.query(
      'SELECT * FROM redes_sociales ORDER BY orden ASC'
    );
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error al obtener redes sociales:', error);
    return NextResponse.json(
      { error: 'Error al obtener las redes sociales' },
      { status: 500 }
    );
  }
}

// POST - Crear una nueva red social
export async function POST(request: NextRequest) {
  try {
    const { nombre, url, icono, username, color, orden, activo } = await request.json();
    
    const result = await db.query(
      `INSERT INTO redes_sociales 
       (nombre, url, icono, username, color, orden, activo) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [nombre, url, icono, username, color, orden, activo ?? true]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error al crear red social:', error);
    return NextResponse.json(
      { error: 'Error al crear la red social' },
      { status: 500 }
    );
  }
}