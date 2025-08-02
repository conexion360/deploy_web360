// src/app/api/nosotros/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener información de Sobre Nosotros
export async function GET() {
  try {
    // Obtener la información principal
    const aboutResult = await db.query(
      'SELECT * FROM sobre_nosotros ORDER BY id ASC LIMIT 1'
    );
    
    // Si no hay datos, devolver un objeto vacío
    if (aboutResult.rows.length === 0) {
      return NextResponse.json({});
    }
    
    const aboutData = aboutResult.rows[0];
    
    // Obtener las características asociadas
    const featuresResult = await db.query(
      'SELECT * FROM caracteristicas WHERE sobre_nosotros_id = $1 ORDER BY orden ASC',
      [aboutData.id]
    );
    
    // Obtener las estadísticas
    const statsResult = await db.query(
      'SELECT * FROM estadisticas ORDER BY orden ASC'
    );
    
    // Combinar todos los datos
    const responseData = {
      ...aboutData,
      caracteristicas: featuresResult.rows,
      estadisticas: statsResult.rows
    };
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error al obtener información de Sobre Nosotros:', error);
    return NextResponse.json(
      { error: 'Error al obtener la información' },
      { status: 500 }
    );
  }
}

// POST - Crear o actualizar información de Sobre Nosotros
export async function POST(request: NextRequest) {
  try {
    const { titulo, descripcion, imagen, caracteristicas, estadisticas } = await request.json();
    
    // Iniciar una transacción
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      
      // Verificar si ya existe una entrada
      const checkResult = await client.query('SELECT id FROM sobre_nosotros LIMIT 1');
      
      let aboutId;
      
      if (checkResult.rows.length === 0) {
        // Crear nueva entrada
        const insertResult = await client.query(
          `INSERT INTO sobre_nosotros (titulo, descripcion, imagen) 
           VALUES ($1, $2, $3) 
           RETURNING id`,
          [titulo, descripcion, imagen]
        );
        aboutId = insertResult.rows[0].id;
      } else {
        // Actualizar entrada existente
        aboutId = checkResult.rows[0].id;
        await client.query(
          `UPDATE sobre_nosotros 
           SET titulo = $1, descripcion = $2, imagen = $3, fecha_actualizacion = CURRENT_TIMESTAMP
           WHERE id = $4`,
          [titulo, descripcion, imagen, aboutId]
        );
        
        // Eliminar características existentes
        await client.query('DELETE FROM caracteristicas WHERE sobre_nosotros_id = $1', [aboutId]);
      }
      
      // Insertar nuevas características
      if (caracteristicas && caracteristicas.length > 0) {
        for (const [index, caract] of caracteristicas.entries()) {
          await client.query(
            `INSERT INTO caracteristicas (titulo, icono, sobre_nosotros_id, orden)
             VALUES ($1, $2, $3, $4)`,
            [caract.titulo, caract.icono, aboutId, index + 1]
          );
        }
      }
      
      // Actualizar estadísticas
      if (estadisticas && estadisticas.length > 0) {
        // Eliminar estadísticas existentes
        await client.query('DELETE FROM estadisticas');
        
        // Insertar nuevas estadísticas
        for (const [index, stat] of estadisticas.entries()) {
          await client.query(
            `INSERT INTO estadisticas (valor, descripcion, orden)
             VALUES ($1, $2, $3)`,
            [stat.valor, stat.descripcion, index + 1]
          );
        }
      }
      
      await client.query('COMMIT');
      
      return NextResponse.json({ success: true, id: aboutId });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error al guardar información de Sobre Nosotros:', error);
    return NextResponse.json(
      { error: 'Error al guardar la información' },
      { status: 500 }
    );
  }
}