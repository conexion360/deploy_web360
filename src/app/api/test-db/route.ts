// src/app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Verificar si el usuario admin existe
    const result = await db.query('SELECT * FROM usuarios WHERE email = $1', ['admin@conexion360sac.com']);
    
    return NextResponse.json({
      connected: true,
      adminExists: result.rows.length > 0,
      adminUser: result.rows.length > 0 ? {
        id: result.rows[0].id,
        nombre: result.rows[0].nombre,
        email: result.rows[0].email,
        rol: result.rows[0].rol
      } : null
    });
  } catch (error: any) {
    console.error('Error en test-db:', error);
    return NextResponse.json({ 
      connected: false, 
      error: error.message || 'Error desconocido'
    }, { status: 500 });
  }
}