// src/app/api/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Buscar usuario por email
    const userResult = await db.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      console.log(`Usuario no encontrado: ${email}`);
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const user = userResult.rows[0];

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.log(`Contraseña incorrecta para usuario: ${email}`);
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Actualizar último acceso
    await db.query(
      'UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generar token JWT usando la clave de .env
    const jwtSecret = process.env.JWT_SECRET || 'secret_key';
    if (!jwtSecret) {
      console.error('JWT_SECRET no está definido en las variables de entorno');
    }

    const token = jwt.sign(
      {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      },
      jwtSecret,
      { expiresIn: '8h' }
    );

    console.log(`Inicio de sesión exitoso para: ${email}`);

    // Devolver respuesta exitosa
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    });
  } catch (error: any) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error en el servidor: ' + (error.message || 'Desconocido') },
      { status: 500 }
    );
  }
}