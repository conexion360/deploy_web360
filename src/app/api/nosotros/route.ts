// src/app/api/nosotros/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener información de Sobre Nosotros
export async function GET(request: NextRequest) {
  try {
    console.log("API: Obteniendo información de Sobre Nosotros");
    
    // Obtener la información principal
    const aboutResult = await db.query(
      'SELECT * FROM sobre_nosotros ORDER BY id ASC LIMIT 1'
    );
    
    // Si no hay datos, devolver un objeto vacío
    if (aboutResult.rows.length === 0) {
      console.log("API: No se encontraron datos de Sobre Nosotros");
      return NextResponse.json({
        titulo: '',
        descripcion: '',
        imagen: '',
        caracteristicas: [],
        estadisticas: []
      });
    }
    
    const aboutData = aboutResult.rows[0];
    console.log("API: Datos de Sobre Nosotros encontrados:", { 
      id: aboutData.id,
      titulo: aboutData.titulo,
      imagen: aboutData.imagen ? "Disponible" : "No disponible" 
    });
    
    // Obtener las características asociadas
    const featuresResult = await db.query(
      'SELECT * FROM caracteristicas WHERE sobre_nosotros_id = $1 ORDER BY orden ASC',
      [aboutData.id]
    );
    console.log(`API: ${featuresResult.rows.length} características encontradas`);
    
    // Obtener las estadísticas
    const statsResult = await db.query(
      'SELECT * FROM estadisticas ORDER BY orden ASC'
    );
    console.log(`API: ${statsResult.rows.length} estadísticas encontradas`);
    
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

// POST - Actualizar o crear información de Sobre Nosotros
export async function POST(request: NextRequest) {
  try {
    console.log("API: Guardando información de Sobre Nosotros");
    
    // Obtener los datos del cuerpo de la solicitud
    const requestData = await request.json();
    const { 
      id, 
      titulo, 
      descripcion, 
      imagen, 
      caracteristicas, 
      estadisticas 
    } = requestData;
    
    // Comenzar una transacción para asegurar que todas las operaciones se completen o ninguna
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      
      let aboutId = id;
      
      // Si no hay ID, o si el ID no existe, insertar un nuevo registro
      if (!aboutId) {
        console.log("API: Creando nuevo registro de Sobre Nosotros");
        const insertAboutResult = await client.query(
          `INSERT INTO sobre_nosotros (titulo, descripcion, imagen) 
           VALUES ($1, $2, $3) 
           RETURNING id`,
          [titulo, descripcion, imagen]
        );
        aboutId = insertAboutResult.rows[0].id;
      } else {
        // Actualizar el registro existente
        console.log(`API: Actualizando registro de Sobre Nosotros con ID ${aboutId}`);
        await client.query(
          `UPDATE sobre_nosotros 
           SET titulo = $1, descripcion = $2, imagen = $3, fecha_actualizacion = CURRENT_TIMESTAMP
           WHERE id = $4`,
          [titulo, descripcion, imagen, aboutId]
        );
      }
      
      // Actualizar características
      if (caracteristicas && Array.isArray(caracteristicas)) {
        console.log(`API: Procesando ${caracteristicas.length} características`);
        
        // Eliminar características antiguas asociadas con este aboutId
        await client.query(
          'DELETE FROM caracteristicas WHERE sobre_nosotros_id = $1',
          [aboutId]
        );
        
        // Insertar nuevas características
        for (const caract of caracteristicas) {
          await client.query(
            `INSERT INTO caracteristicas (titulo, icono, orden, sobre_nosotros_id) 
             VALUES ($1, $2, $3, $4)`,
            [caract.titulo, caract.icono, caract.orden, aboutId]
          );
        }
      }
      
      // Actualizar estadísticas
      if (estadisticas && Array.isArray(estadisticas)) {
        console.log(`API: Procesando ${estadisticas.length} estadísticas`);
        
        // Eliminar todas las estadísticas existentes
        await client.query('DELETE FROM estadisticas');
        
        // Insertar nuevas estadísticas
        for (const stat of estadisticas) {
          await client.query(
            `INSERT INTO estadisticas (valor, descripcion, orden) 
             VALUES ($1, $2, $3)`,
            [stat.valor, stat.descripcion, stat.orden]
          );
        }
      }
      
      // Confirmar la transacción
      await client.query('COMMIT');
      
      // Obtener los datos actualizados para devolverlos
      const aboutResult = await client.query(
        'SELECT * FROM sobre_nosotros WHERE id = $1',
        [aboutId]
      );
      
      const featuresResult = await client.query(
        'SELECT * FROM caracteristicas WHERE sobre_nosotros_id = $1 ORDER BY orden ASC',
        [aboutId]
      );
      
      const statsResult = await client.query(
        'SELECT * FROM estadisticas ORDER BY orden ASC'
      );
      
      const responseData = {
        ...aboutResult.rows[0],
        caracteristicas: featuresResult.rows,
        estadisticas: statsResult.rows
      };
      
      console.log("API: Datos de Sobre Nosotros guardados correctamente");
      return NextResponse.json(responseData);
      
    } catch (error) {
      // Si hay algún error, revertir la transacción
      await client.query('ROLLBACK');
      throw error;
    } finally {
      // Liberar el cliente de vuelta al pool
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