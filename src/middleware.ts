// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Rutas que nunca deben requerir autenticación
  if (path === '/api/auth') {
    // Permitir acceso a la ruta de autenticación sin verificación
    return NextResponse.next();
  }
  
  // Otras rutas públicas
  const publicPaths = [
    '/api/db-check',
    '/api/test-db',
    '/api/hero',
    '/api/galeria',
    '/api/generos',
    '/api/musica',
    '/api/nosotros',
    '/api/redes',
    '/api/configuracion',
    '/api/mensajes'
  ];

  // Si la ruta es pública o no es una API, permitir acceso
  if (!path.startsWith('/api/') || publicPaths.some(publicPath => path.startsWith(publicPath))) {
    return NextResponse.next();
  }

  // Verificar token JWT para rutas protegidas
  const auth = await verifyAuth(request);
  if (!auth.success) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};