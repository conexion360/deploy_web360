// src/app/api/mensajes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener todos los mensajes
export async function GET(request: NextRequest) {
  try {
    // Obtener parámetros de consulta
    const url = new URL(request.url);
    const leido = url.searchParams.get('leido');
    const respondido = url.searchParams.get('respondido');
    
    let query = 'SELECT * FROM mensajes_contacto';
    const params: any[] = [];
    
    // Construir la consulta según los filtros
    if (leido !== null || respondido !== null) {
      query += ' WHERE';
      
      if (leido !== null) {
        query += ' leido = $1';
        params.push(leido === 'true');
      }
      
      if (respondido !== null) {
        if (leido !== null) {
          query += ' AND';
        }
        query += ' respondido = $' + (params.length + 1);
        params.push(respondido === 'true');
      }
    }
    
    // Ordenar por fecha, más recientes primero
    query += ' ORDER BY fecha_creacion DESC';
    
    const result = await db.query(query, params);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    return NextResponse.json(
      { error: 'Error al obtener los mensajes' },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo mensaje (para formulario de contacto)
export async function POST(request: NextRequest) {
  try {
    const { nombre, email, telefono, mensaje } = await request.json();
    
    const result = await db.query(
      `INSERT INTO mensajes_contacto 
       (nombre, email, telefono, mensaje) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [nombre, email, telefono || null, mensaje]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error al crear mensaje:', error);
    return NextResponse.json(
      { error: 'Error al enviar el mensaje' },
      { status: 500 }
    );
  }
}