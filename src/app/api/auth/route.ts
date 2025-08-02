// src/app/api/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // Registrar el intento de inicio de sesión
    console.log(`Intento de inicio de sesión para: ${email}`);

    // Comprobar que la base de datos está conectada
    try {
      await db.query('SELECT 1');
    } catch (dbError: any) {
      console.error('Error de conexión a la base de datos:', dbError);
      return NextResponse.json(
        { error: 'Error de conexión a la base de datos' },
        { status: 500 }
      );
    }

    // Buscar usuario por email
    const userResult = await db.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      console.log(`Usuario no encontrado: ${email}`);
      
      // Solo para el usuario admin predeterminado, intenta crearlo si no existe
      if (email === 'admin@conexion360sac.com' && password === 'admin123') {
        try {
          // Hashear la contraseña admin123
          const hashedPassword = await bcrypt.hash('admin123', 10);
          
          // Insertar el usuario admin predeterminado
          const insertResult = await db.query(
            `INSERT INTO usuarios (nombre, email, password, rol) 
             VALUES ('Administrador', 'admin@conexion360sac.com', $1, 'superadmin')
             RETURNING id, nombre, email, rol`,
            [hashedPassword]
          );
          
          if (insertResult.rows.length > 0) {
            console.log('Usuario admin creado automáticamente');
            
            const newUser = insertResult.rows[0];
            
            // Generar token JWT
            const jwtSecret = process.env.JWT_SECRET || 'secret_key';
            const token = jwt.sign(
              {
                id: newUser.id,
                nombre: newUser.nombre,
                email: newUser.email,
                rol: newUser.rol
              },
              jwtSecret,
              { expiresIn: '8h' }
            );
            
            return NextResponse.json({
              token,
              user: {
                id: newUser.id,
                nombre: newUser.nombre,
                email: newUser.email,
                rol: newUser.rol
              },
              message: 'Usuario administrador creado automáticamente'
            });
          }
        } catch (createError) {
          console.error('Error al crear usuario admin:', createError);
        }
      }
      
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const user = userResult.rows[0];

    // Verificar contraseña
    let passwordMatch;
    try {
      passwordMatch = await bcrypt.compare(password, user.password);
    } catch (bcryptError) {
      console.error('Error al verificar contraseña con bcrypt:', bcryptError);
      
      // Comprobación directa para el admin por defecto (fallback)
      if (email === 'admin@conexion360sac.com' && 
          password === 'admin123' && 
          user.password === '$2a$10$Ck6VzMRWF8bF7nUXFU9JzeQLVk1PEsKrFS7Azlb0xNz3S9FQUn.Ra') {
        passwordMatch = true;
      } else {
        return NextResponse.json(
          { error: 'Error al verificar credenciales' },
          { status: 500 }
        );
      }
    }
    
    if (!passwordMatch) {
      console.log(`Contraseña incorrecta para usuario: ${email}`);
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Actualizar último acceso
    try {
      await db.query(
        'UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );
    } catch (updateError) {
      console.warn('No se pudo actualizar último acceso:', updateError);
      // Continuamos a pesar del error
    }

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