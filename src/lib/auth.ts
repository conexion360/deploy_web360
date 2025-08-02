// src/lib/auth.ts
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

interface AuthUser {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

interface AuthResult {
  success: boolean;
  user: AuthUser | null;
  error: string | null;
  status: number;
}

export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  try {
    // Obtener token de autorización
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        error: 'Token no proporcionado',
        status: 401,
        user: null
      };
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'secret_key';
    
    // Verificar el token
    const decoded = jwt.verify(token, secret) as AuthUser;

    // Verificar que el token decodificado contiene la info correcta
    if (!decoded || typeof decoded !== 'object' || !decoded.id) {
      return {
        success: false,
        error: 'Token inválido',
        status: 401,
        user: null
      };
    }

    return {
      success: true,
      user: decoded,
      error: null,
      status: 200
    };
  } catch (error) {
    console.error('Error en verificación de autenticación:', error);
    return {
      success: false,
      error: 'Error de autenticación',
      status: 401,
      user: null
    };
  }
}