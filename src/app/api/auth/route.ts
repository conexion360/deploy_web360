// src/app/api/auth-debug/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // Log the authentication attempt
    console.log('DEBUG: Auth attempt with email:', email);
    
    // Check database connection
    try {
      await db.query('SELECT 1');
      console.log('DEBUG: Database connection successful');
    } catch (dbError: any) {
      console.error('DEBUG: Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed', details: dbError.message },
        { status: 500 }
      );
    }

    // Look for user in database
    const userResult = await db.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );

    // Log user search result
    if (userResult.rows.length === 0) {
      console.log('DEBUG: User not found in database');
      
      // List all users in the database
      const allUsers = await db.query('SELECT id, nombre, email, rol FROM usuarios');
      console.log('DEBUG: All users in database:', allUsers.rows);
      
      return NextResponse.json(
        { 
          error: 'User not found',
          allUsers: allUsers.rows
        },
        { status: 404 }
      );
    }

    console.log('DEBUG: User found:', {
      id: userResult.rows[0].id,
      nombre: userResult.rows[0].nombre,
      email: userResult.rows[0].email,
      rol: userResult.rows[0].rol
    });

    // Check if password field exists and has expected format
    const storedPassword = userResult.rows[0].password;
    console.log('DEBUG: Stored password format check:', {
      exists: !!storedPassword,
      length: storedPassword ? storedPassword.length : 0,
      startsWithBcrypt: storedPassword ? storedPassword.startsWith('$2') : false
    });

    // Return debug info
    return NextResponse.json({
      debug: true,
      userExists: true,
      email: email,
      userInfo: {
        id: userResult.rows[0].id,
        nombre: userResult.rows[0].nombre,
        email: userResult.rows[0].email,
        rol: userResult.rows[0].rol,
        ultimo_acceso: userResult.rows[0].ultimo_acceso
      },
      passwordInfo: {
        exists: !!storedPassword,
        length: storedPassword ? storedPassword.length : 0,
        startsWithBcrypt: storedPassword ? storedPassword.startsWith('$2') : false
      },
      jwtSecret: {
        exists: !!process.env.JWT_SECRET,
        length: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0
      }
    });
  } catch (error: any) {
    console.error('DEBUG: Auth debug error:', error);
    return NextResponse.json(
      { error: 'Auth debug error', details: error.message },
      { status: 500 }
    );
  }
}