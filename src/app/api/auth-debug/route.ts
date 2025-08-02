// src/app/api/auth-debug/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log('Debug login attempt:', { email });

    // Buscar usuario por email
    const userResult = await db.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      console.log('Usuario no encontrado');
      return NextResponse.json({
        success: false,
        error: 'Usuario no encontrado',
        step: 'email_check'
      });
    }

    const user = userResult.rows[0];
    console.log('Usuario encontrado:', { id: user.id, nombre: user.nombre, email: user.email });

    // Verificar contraseña
    console.log('Verificando contraseña...');
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      console.log('Contraseña incorrecta');
      return NextResponse.json({
        success: false,
        error: 'Contraseña incorrecta',
        step: 'password_check',
        passwordLength: password.length,
        dbPasswordHash: user.password
      });
    }

    console.log('Contraseña correcta');
    
    return NextResponse.json({
      success: true,
      message: 'Autenticación exitosa en depuración',
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