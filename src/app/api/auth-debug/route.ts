// src/app/api/auth-debug/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log('Debug login attempt:', { email });

    // Primero, verificar la conexión a la base de datos
    let dbStatus;
    try {
      const testConnection = await db.query('SELECT NOW()');
      dbStatus = {
        connected: true,
        timestamp: testConnection.rows[0].now
      };
    } catch (dbError: any) {
      dbStatus = {
        connected: false,
        error: dbError.message
      };
      
      return NextResponse.json({
        success: false,
        error: 'Error de conexión a la base de datos',
        step: 'db_connection',
        dbStatus
      });
    }

    // Buscar usuario por email
    let userResult;
    try {
      userResult = await db.query(
        'SELECT * FROM usuarios WHERE email = $1',
        [email]
      );
    } catch (queryError: any) {
      return NextResponse.json({
        success: false,
        error: 'Error al consultar usuario',
        step: 'user_query',
        dbStatus,
        queryError: queryError.message
      });
    }

    if (userResult.rows.length === 0) {
      console.log('Usuario no encontrado');
      
      // Intentar obtener todos los usuarios para depuración
      try {
        const allUsers = await db.query('SELECT id, nombre, email, rol FROM usuarios');
        
        return NextResponse.json({
          success: false,
          error: 'Usuario no encontrado',
          step: 'email_check',
          dbStatus,
          usersInDB: allUsers.rows.length,
          allUsers: allUsers.rows
        });
      } catch (error: any) {
        return NextResponse.json({
          success: false,
          error: 'Usuario no encontrado y error al listar usuarios',
          step: 'email_check',
          dbStatus,
          queryError: error.message
        });
      }
    }

    const user = userResult.rows[0];
    console.log('Usuario encontrado:', { id: user.id, nombre: user.nombre, email: user.email });

    // Verificar contraseña
    console.log('Verificando contraseña...');
    let passwordMatch;
    try {
      passwordMatch = await bcrypt.compare(password, user.password);
    } catch (bcryptError: any) {
      return NextResponse.json({
        success: false,
        error: 'Error al verificar contraseña',
        step: 'password_verification',
        dbStatus,
        bcryptError: bcryptError.message,
        passwordProvided: {
          length: password.length,
          value: password.substring(0, 3) + '***'
        },
        storedHash: {
          length: user.password.length,
          value: user.password.substring(0, 10) + '***'
        }
      });
    }
    
    if (!passwordMatch) {
      console.log('Contraseña incorrecta');
      return NextResponse.json({
        success: false,
        error: 'Contraseña incorrecta',
        step: 'password_check',
        dbStatus,
        passwordLength: password.length,
        dbPasswordHash: user.password,
        passwordHashPrefix: user.password.substring(0, 10)
      });
    }

    console.log('Contraseña correcta');
    
    return NextResponse.json({
      success: true,
      message: 'Autenticación exitosa en depuración',
      dbStatus,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    });
  } catch (error: any) {
    console.error('Error en auth-debug:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Error desconocido',
      step: 'exception'
    }, { status: 500 });
  }
}