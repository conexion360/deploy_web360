// scripts/create-admin.js
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Datos del administrador
const adminData = {
  nombre: 'Administrador',
  email: 'admin@conexion360sac.com',
  password: 'admin123', // Esta contraseña será hasheada
  rol: 'superadmin'
};

// Conexión a la base de datos
console.log('Iniciando creación de usuario administrador...');
console.log(`Variable DATABASE_URL ${process.env.DATABASE_URL ? 'está configurada' : 'NO ESTÁ CONFIGURADA'}`);

if (!process.env.DATABASE_URL) {
  console.error('ERROR: La variable de entorno DATABASE_URL no está configurada.');
  console.error('Por favor, configura esta variable en tu proyecto Railway o en tu archivo .env');
  process.exit(1);
}

// Configuración del pool de conexiones con SSL
console.log(`Conectando a: ${process.env.DATABASE_URL.split('@')[1].split('/')[0]}`);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Necesario para conexiones remotas a Railway
});

const createAdmin = async () => {
  const client = await pool.connect();
  try {
    console.log('Probando conexión a la base de datos...');
    const testResult = await client.query('SELECT NOW() as time');
    console.log(`✅ Conexión exitosa! Hora del servidor: ${testResult.rows[0].time}`);

    // Verificar si la tabla usuarios existe
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'usuarios'
      )
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('La tabla usuarios no existe. Creándola...');
      
      // Crear la tabla usuarios si no existe
      await client.query(`
        CREATE TABLE IF NOT EXISTS usuarios (
          id SERIAL PRIMARY KEY,
          nombre VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(100) NOT NULL,
          rol VARCHAR(50) NOT NULL DEFAULT 'admin',
          activo BOOLEAN NOT NULL DEFAULT true,
          ultimo_acceso TIMESTAMP,
          fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✓ Tabla usuarios creada');
    } else {
      // Verificar si la columna fecha_actualizacion existe
      const columnCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = 'usuarios'
          AND column_name = 'fecha_actualizacion'
        )
      `);
      
      if (!columnCheck.rows[0].exists) {
        console.log('La columna fecha_actualizacion no existe. Añadiéndola...');
        await client.query(`
          ALTER TABLE usuarios 
          ADD COLUMN fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        `);
        console.log('✓ Columna fecha_actualizacion añadida');
      }
    }

    // Verificar si el administrador ya existe
    const userCheck = await client.query('SELECT * FROM usuarios WHERE email = $1', [adminData.email]);
    
    if (userCheck.rows.length > 0) {
      console.log('El usuario administrador ya existe. Actualizando contraseña...');
      
      // Generar hash de la contraseña
      const hashedPassword = await bcrypt.hash(adminData.password, 10);
      
      // Actualizar la contraseña del administrador
      await client.query(
        'UPDATE usuarios SET password = $1, fecha_actualizacion = CURRENT_TIMESTAMP WHERE email = $2',
        [hashedPassword, adminData.email]
      );
      
      console.log('✓ Contraseña del administrador actualizada correctamente');
    } else {
      console.log('Creando nuevo usuario administrador...');
      
      // Generar hash de la contraseña
      const hashedPassword = await bcrypt.hash(adminData.password, 10);
      
      // Insertar el nuevo administrador
      await client.query(
        `INSERT INTO usuarios (nombre, email, password, rol) 
         VALUES ($1, $2, $3, $4)`,
        [adminData.nombre, adminData.email, hashedPassword, adminData.rol]
      );
      
      console.log('✓ Usuario administrador creado correctamente');
    }

    console.log('\nInformación del administrador:');
    console.log(`   Nombre: ${adminData.nombre}`);
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Contraseña: ${adminData.password}`);
    console.log(`   Rol: ${adminData.rol}`);
    console.log('\n¡IMPORTANTE! Guarda esta información en un lugar seguro.');

  } catch (err) {
    console.error('Error al crear el usuario administrador:', err);
    throw err;
  } finally {
    client.release();
    pool.end();
  }
};

// Ejecutar la creación del administrador
createAdmin().catch(err => {
  console.error('Falló la creación del administrador:', err);
  process.exit(1);
});