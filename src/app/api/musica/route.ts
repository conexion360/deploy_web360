// src/app/api/musica/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener todas las canciones con filtros opcionales
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const destacado = url.searchParams.get('destacado');
    const genero_id = url.searchParams.get('genero_id');
    const reproducible_web = url.searchParams.get('reproducible_web');
    
    // Build the query
    let query = `
      SELECT m.*, g.nombre as genero_nombre
      FROM musica m
      LEFT JOIN generos g ON m.genero_id = g.id
    `;
    
    // Add WHERE clause if we have any filters
    const conditions: string[] = [];
    const params: any[] = [];
    
    if (destacado !== null) {
      conditions.push(`m.destacado = $${params.length + 1}`);
      params.push(destacado === 'true');
    }
    
    if (genero_id !== null) {
      conditions.push(`m.genero_id = $${params.length + 1}`);
      params.push(parseInt(genero_id));
    }
    
    if (reproducible_web !== null) {
      conditions.push(`m.reproducible_web = $${params.length + 1}`);
      params.push(reproducible_web === 'true');
    }
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    // Add ORDER BY
    query += ` ORDER BY m.orden ASC NULLS LAST, m.fecha_creacion DESC`;
    
    // Execute the query
    const result = await db.query(query, params);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error al obtener música:', error);
    return NextResponse.json(
      { error: 'Error al obtener la música' },
      { status: 500 }
    );
  }
}