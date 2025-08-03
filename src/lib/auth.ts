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
    
    try {
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
    } catch (jwtError: any) {
      // Manejar específicamente el error de token expirado
      if (jwtError.name === 'TokenExpiredError') {
        console.log('Token expirado:', jwtError.expiredAt);
        
        // En desarrollo, podemos ser más permisivos
        if (process.env.NODE_ENV === 'development') {
          console.log('Modo desarrollo: permitiendo token expirado');
          
          // Decodificar el token sin verificar para obtener los datos del usuario
          const decoded = jwt.decode(token) as AuthUser;
          
          if (decoded && decoded.id) {
            return {
              success: true,
              user: decoded,
              error: null,
              status: 200
            };
          }
        }
        
        return {
          success: false,
          error: 'Token expirado',
          status: 401,
          user: null
        };
      }
      
      // Otros errores de JWT
      return {
        success: false,
        error: 'Token inválido',
        status: 401,
        user: null
      };
    }
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

// Función auxiliar para generar un nuevo token
export function generateToken(user: Omit<AuthUser, 'iat' | 'exp'>): string {
  const secret = process.env.JWT_SECRET || 'secret_key';
  
  // Generar token con expiración de 24 horas
  return jwt.sign(
    {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol
    },
    secret,
    { expiresIn: '24h' } // Aumentado a 24 horas
  );
}

// Función para verificar si un token está próximo a expirar
export function isTokenExpiringSoon(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) return true;
    
    const expirationTime = decoded.exp * 1000; // Convertir a milisegundos
    const currentTime = Date.now();
    const timeUntilExpiration = expirationTime - currentTime;
    
    // Si expira en menos de 1 hora, considerarlo como próximo a expirar
    return timeUntilExpiration < 60 * 60 * 1000;
  } catch (error) {
    return true;
  }
}