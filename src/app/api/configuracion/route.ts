// src/app/api/configuracion/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener la configuración del sitio
export async function GET() {
  try {
    const result = await db.query(
      'SELECT * FROM configuracion LIMIT 1'
    );
    
    // Si no hay configuración, devolver un objeto vacío
    if (result.rows.length === 0) {
      return NextResponse.json({});
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    return NextResponse.json(
      { error: 'Error al obtener la configuración' },
      { status: 500 }
    );
  }
}

// POST - Actualizar la configuración del sitio
export async function POST(request: NextRequest) {
  try {
    const {
      nombre_sitio,
      logo,
      favicon,
      email_contacto,
      telefono,
      direccion,
      footer_texto,
      facebook,
      instagram,
      tiktok,
      youtube
    } = await request.json();
    
    // Verificar si ya existe una configuración
    const checkResult = await db.query('SELECT id FROM configuracion LIMIT 1');
    
    let result;
    
    if (checkResult.rows.length === 0) {
      // Crear nueva configuración
      result = await db.query(
        `INSERT INTO configuracion (
          nombre_sitio, logo, favicon, email_contacto, telefono, 
          direccion, footer_texto, facebook, instagram, tiktok, youtube
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
        RETURNING *`,
        [
          nombre_sitio, logo, favicon, email_contacto, telefono,
          direccion, footer_texto, facebook, instagram, tiktok, youtube
        ]
      );
    } else {
      // Actualizar configuración existente
      const id = checkResult.rows[0].id;
      result = await db.query(
        `UPDATE configuracion SET 
          nombre_sitio = $1, logo = $2, favicon = $3, email_contacto = $4, 
          telefono = $5, direccion = $6, footer_texto = $7, facebook = $8, 
          instagram = $9, tiktok = $10, youtube = $11, fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id = $12 
        RETURNING *`,
        [
          nombre_sitio, logo, favicon, email_contacto, telefono,
          direccion, footer_texto, facebook, instagram, tiktok, youtube, id
        ]
      );
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la configuración' },
      { status: 500 }
    );
  }
}