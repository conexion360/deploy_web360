const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Configuración de la conexión a PostgreSQL (ajusta si necesitas)
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '147ABC55',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '9134'),
  database: process.env.DB_NAME || 'conexion360',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function createAdminUser() {
  const client = await pool.connect();

  try {
    console.log('Conectado a PostgreSQL. Creando usuario administrador...');

    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'usuarios'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('La tabla usuarios no existe. Creando tabla...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS usuarios (
          id SERIAL PRIMARY KEY,
          nombre VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          rol VARCHAR(20) DEFAULT 'admin' NOT NULL,
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          ultimo_acceso TIMESTAMP
        );
      `);
      console.log('Tabla usuarios creada correctamente.');
    }

    const userCheck = await client.query(
      "SELECT * FROM usuarios WHERE email = 'admin@conexion360sac.com'"
    );

    const hashedPassword = await bcrypt.hash('admin123', 10);

    if (userCheck.rows.length > 0) {
      console.log('El usuario admin ya existe. Actualizando contraseña...');
      await client.query(
        `UPDATE usuarios 
         SET password = $1, 
             nombre = 'Administrador', 
             rol = 'superadmin' 
         WHERE email = 'admin@conexion360sac.com'`,
        [hashedPassword]
      );
      console.log('Contraseña de administrador actualizada correctamente.');
    } else {
      console.log('Creando nuevo usuario administrador...');
      await client.query(
        `INSERT INTO usuarios (nombre, email, password, rol) 
         VALUES ('Administrador', 'admin@conexion360sac.com', $1, 'superadmin')`,
        [hashedPassword]
      );
      console.log('Usuario administrador creado correctamente.');
    }

    const userVerify = await client.query(
      "SELECT id, nombre, email, rol FROM usuarios WHERE email = 'admin@conexion360sac.com'"
    );

    if (userVerify.rows.length > 0) {
      console.log('Verificación exitosa:');
      console.log('- ID:', userVerify.rows[0].id);
      console.log('- Nombre:', userVerify.rows[0].nombre);
      console.log('- Email:', userVerify.rows[0].email);
      console.log('- Rol:', userVerify.rows[0].rol);
    } else {
      console.log('ERROR: No se pudo verificar la creación del usuario.');
    }

    console.log('\nInformación para inicio de sesión:');
    console.log('- Email: admin@conexion360sac.com');
    console.log('- Contraseña: admin123');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

createAdminUser().catch(console.error);
