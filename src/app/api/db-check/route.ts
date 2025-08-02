// src/app/api/db-check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const connected = await checkDatabaseConnection();
    return NextResponse.json({ connected });
  } catch (error) {
    console.error('Error al verificar la conexión a la base de datos:', error);
    return NextResponse.json({ connected: false, error: 'Error al verificar la conexión' });
  }
}
