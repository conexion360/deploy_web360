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
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const user = userResult.rows[0];

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
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

    // Generar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '8h' }
    );

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
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}