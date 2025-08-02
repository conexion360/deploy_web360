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