// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Rutas que nunca requieren autenticación
  const publicRoutes = [
    '/api/auth',
    '/api/auth-debug',
    '/api/test-db',
    '/api/imagekit-auth'
  ];
  
  if (publicRoutes.some(route => path.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Rutas públicas GET
  const publicGetRoutes = [
    '/api/hero',
    '/api/galeria',
    '/api/generos',
    '/api/musica',
    '/api/nosotros',
    '/api/redes',
    '/api/configuracion'
  ];
  
  // Permitir GET en rutas públicas
  if (request.method === 'GET' && publicGetRoutes.some(route => path.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Permitir POST a mensajes (formulario de contacto)
  if (path === '/api/mensajes' && request.method === 'POST') {
    return NextResponse.next();
  }
  
  // Si no es una ruta API, permitir
  if (!path.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // === IMPORTANTE: EN DESARROLLO, PERMITIR TODO ===
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Middleware DEV] Permitiendo ${request.method} ${path} sin verificación`);
    return NextResponse.next();
  }
  
  // === EN PRODUCCIÓN, VERIFICAR TOKEN ===
  const authHeader = request.headers.get('authorization');
  console.log(`[Middleware] Verificando auth para ${request.method} ${path}`);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log(`[Middleware] Token no proporcionado o formato incorrecto`);
    return NextResponse.json(
      { error: 'Token no proporcionado' },
      { status: 401 }
    );
  }
  
  // Por ahora, en producción solo verificamos que existe el token
  // Aquí deberías agregar la verificación JWT real
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};