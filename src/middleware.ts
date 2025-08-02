
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth';

// Este middleware verifica la autenticación para rutas de API protegidas
export async function middleware(request: NextRequest) {
  // Rutas que no requieren autenticación
  const publicPaths = [
    '/api/auth',
    '/api/db-check'
  ];

  // Si la ruta es pública, permitir acceso
  const path = request.nextUrl.pathname;
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

  // Si la autenticación es exitosa, permitir acceso
  return NextResponse.next();
}

// Configurar el matcher para las rutas de API
export const config = {
  matcher: '/api/:path*',
};