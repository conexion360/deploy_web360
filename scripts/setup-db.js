// scripts/setup-db.js
require('dotenv').config();
const { Pool } = require('pg');

// Log database connection attempt
console.log('Setting up database connection...');
console.log(`DATABASE_URL is ${process.env.DATABASE_URL ? 'set' : 'NOT SET'}`);

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set.');
  console.error('Please set this variable in your Railway project or .env file.');
  process.exit(1);
}

// Setup PostgreSQL connection
console.log(`Connecting to: ${process.env.DATABASE_URL.split('@')[1].split('/')[0]}`);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Necesario para conexiones remotas a Railway
});

// Database schema - Tables creation
const createTables = async () => {
  const client = await pool.connect();
  try {
    console.log('Testing database connection...');
    const testResult = await client.query('SELECT NOW() as time');
    console.log(`✅ Database connection successful! Server time: ${testResult.rows[0].time}`);

    await client.query('BEGIN');

    console.log('Creating tables if they do not exist...');

    // Create usuarios (users) table
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
    console.log('✓ usuarios table created');

    // Create hero_slides table
    await client.query(`
      CREATE TABLE IF NOT EXISTS hero_slides (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(100) NOT NULL,
        descripcion TEXT,
        imagen_desktop VARCHAR(255) NOT NULL,
        imagen_mobile VARCHAR(255) NOT NULL,
        orden INT NOT NULL DEFAULT 1,
        activo BOOLEAN NOT NULL DEFAULT true,
        fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ hero_slides table created');

    // Create sobre_nosotros table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sobre_nosotros (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(100) NOT NULL,
        descripcion TEXT NOT NULL,
        imagen VARCHAR(255),
        fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ sobre_nosotros table created');

    // Create caracteristicas table (features for sobre_nosotros)
    await client.query(`
      CREATE TABLE IF NOT EXISTS caracteristicas (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(100) NOT NULL,
        icono VARCHAR(50),
        orden INT NOT NULL DEFAULT 1,
        sobre_nosotros_id INT NOT NULL,
        fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sobre_nosotros_id) REFERENCES sobre_nosotros(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ caracteristicas table created');

    // Create estadisticas table (statistics)
    await client.query(`
      CREATE TABLE IF NOT EXISTS estadisticas (
        id SERIAL PRIMARY KEY,
        valor VARCHAR(50) NOT NULL,
        descripcion VARCHAR(100) NOT NULL,
        orden INT NOT NULL DEFAULT 1,
        fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ estadisticas table created');

    // Create galeria table
    await client.query(`
      CREATE TABLE IF NOT EXISTS galeria (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(100) NOT NULL,
        descripcion TEXT,
        imagen VARCHAR(255) NOT NULL,
        thumbnail VARCHAR(255),
        orden INT NOT NULL DEFAULT 1,
        categoria VARCHAR(50),
        destacado BOOLEAN NOT NULL DEFAULT false,
        fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ galeria table created');

    // Create generos table (music genres)
    await client.query(`
      CREATE TABLE IF NOT EXISTS generos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        imagen VARCHAR(255) NOT NULL,
        icono VARCHAR(50),
        orden INT NOT NULL DEFAULT 1,
        activo BOOLEAN NOT NULL DEFAULT true,
        fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ generos table created');

    // Create musica table
    await client.query(`
      CREATE TABLE IF NOT EXISTS musica (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(100) NOT NULL,
        artista VARCHAR(100),
        archivo VARCHAR(255) NOT NULL,
        imagen_cover VARCHAR(255),
        genero_id INT,
        destacado BOOLEAN NOT NULL DEFAULT false,
        reproducible_web BOOLEAN NOT NULL DEFAULT true,
        orden INT,
        fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (genero_id) REFERENCES generos(id) ON DELETE SET NULL
      )
    `);
    console.log('✓ musica table created');

    // Create redes_sociales table
    await client.query(`
      CREATE TABLE IF NOT EXISTS redes_sociales (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(50) NOT NULL,
        url VARCHAR(255) NOT NULL,
        icono VARCHAR(50),
        username VARCHAR(100),
        color VARCHAR(50),
        orden INT NOT NULL DEFAULT 1,
        activo BOOLEAN NOT NULL DEFAULT true,
        fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ redes_sociales table created');

    // Create mensajes_contacto table
    await client.query(`
      CREATE TABLE IF NOT EXISTS mensajes_contacto (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        telefono VARCHAR(50),
        mensaje TEXT NOT NULL,
        leido BOOLEAN NOT NULL DEFAULT false,
        respondido BOOLEAN NOT NULL DEFAULT false,
        fecha_lectura TIMESTAMP,
        fecha_respuesta TIMESTAMP,
        fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ mensajes_contacto table created');

    // Create configuracion table
    await client.query(`
      CREATE TABLE IF NOT EXISTS configuracion (
        id SERIAL PRIMARY KEY,
        nombre_sitio VARCHAR(100) NOT NULL,
        logo VARCHAR(255),
        favicon VARCHAR(255),
        email_contacto VARCHAR(100),
        telefono VARCHAR(50),
        direccion TEXT,
        footer_texto TEXT,
        facebook VARCHAR(255),
        instagram VARCHAR(255),
        tiktok VARCHAR(255),
        youtube VARCHAR(255),
        fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ configuracion table created');

    // Check if default admin user exists
    const userResult = await client.query(
      'SELECT * FROM usuarios WHERE email = $1',
      ['admin@conexion360sac.com']
    );

    // Create default admin user if not exists
    if (userResult.rows.length === 0) {
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await client.query(
        `INSERT INTO usuarios (nombre, email, password, rol) 
         VALUES ('Administrador', 'admin@conexion360sac.com', $1, 'superadmin')`,
        [hashedPassword]
      );
      console.log('✓ Default admin user created:');
      console.log('   Email: admin@conexion360sac.com');
      console.log('   Password: admin123');
    } else {
      console.log('✓ Default admin user already exists');
    }

    await client.query('COMMIT');
    console.log('Database setup completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error setting up database:', err);
    throw err;
  } finally {
    client.release();
    pool.end();
  }
};

// Run the database setup
createTables().catch(err => {
  console.error('Failed to set up database:', err);
  process.exit(1);
});