// setup-db.js
const { Pool } = require('pg');
require('dotenv').config();

// Verificar la variable de entorno DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('❌ Error: La variable DATABASE_URL no está definida');
  console.error('Por favor, configura esta variable en el archivo .env o en las variables de entorno');
  process.exit(1);
}

// Ocultar información sensible en los logs
const dbUrl = process.env.DATABASE_URL;
const maskedUrl = dbUrl.replace(/\/\/[^:]+:[^@]+@/, '//****:****@');
console.log('Conectando a base de datos con URL:', maskedUrl);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Sentencias SQL para crear las tablas
const createTablesQueries = [
  // Tabla de usuarios para administración
  `CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'admin',
    ultimo_acceso TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Tabla de configuración del sitio
  `CREATE TABLE IF NOT EXISTS configuracion (
    id SERIAL PRIMARY KEY,
    nombre_sitio VARCHAR(100) NOT NULL,
    logo TEXT,
    favicon TEXT,
    email_contacto VARCHAR(100),
    telefono VARCHAR(20),
    direccion TEXT,
    footer_texto TEXT,
    facebook TEXT,
    instagram TEXT,
    tiktok TEXT,
    youtube TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Tabla de slides del hero
  `CREATE TABLE IF NOT EXISTS hero_slides (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    imagen_desktop TEXT NOT NULL,
    imagen_mobile TEXT NOT NULL,
    orden INT DEFAULT 1,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Tabla para la sección "Sobre Nosotros"
  `CREATE TABLE IF NOT EXISTS sobre_nosotros (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    imagen TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Tabla de características para "Sobre Nosotros"
  `CREATE TABLE IF NOT EXISTS caracteristicas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    icono VARCHAR(50),
    orden INT DEFAULT 1,
    sobre_nosotros_id INT REFERENCES sobre_nosotros(id) ON DELETE CASCADE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Tabla de estadísticas
  `CREATE TABLE IF NOT EXISTS estadisticas (
    id SERIAL PRIMARY KEY,
    valor VARCHAR(50) NOT NULL,
    descripcion VARCHAR(100) NOT NULL,
    orden INT DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Tabla de galería de imágenes
  `CREATE TABLE IF NOT EXISTS galeria (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    imagen TEXT NOT NULL,
    thumbnail TEXT,
    orden INT DEFAULT 1,
    categoria VARCHAR(100),
    destacado BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Tabla de géneros musicales
  `CREATE TABLE IF NOT EXISTS generos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    imagen TEXT,
    icono VARCHAR(50),
    orden INT DEFAULT 1,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Tabla de música
  `CREATE TABLE IF NOT EXISTS musica (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    artista VARCHAR(200),
    archivo TEXT NOT NULL,
    imagen_cover TEXT,
    genero_id INT REFERENCES generos(id) ON DELETE SET NULL,
    destacado BOOLEAN DEFAULT FALSE,
    reproducible_web BOOLEAN DEFAULT TRUE,
    orden INT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Tabla de redes sociales
  `CREATE TABLE IF NOT EXISTS redes_sociales (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    url TEXT NOT NULL,
    icono VARCHAR(50),
    username VARCHAR(100),
    color VARCHAR(20),
    orden INT DEFAULT 1,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Tabla de mensajes de contacto
  `CREATE TABLE IF NOT EXISTS mensajes_contacto (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    mensaje TEXT NOT NULL,
    leido BOOLEAN DEFAULT FALSE,
    respondido BOOLEAN DEFAULT FALSE,
    fecha_lectura TIMESTAMP,
    fecha_respuesta TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`
];

// Datos iniciales para insertar en la base de datos
const insertInitialDataQueries = [
  // Usuario administrador por defecto
  `INSERT INTO usuarios (nombre, email, password, rol)
   VALUES ('Administrador', 'admin@conexion360sac.com', '$2a$10$Ck6VzMRWF8bF7nUXFU9JzeQLVk1PEsKrFS7Azlb0xNz3S9FQUn.Ra', 'superadmin')
   ON CONFLICT (email) DO NOTHING`,

  // Configuración inicial del sitio
  `INSERT INTO configuracion (nombre_sitio, logo, favicon, email_contacto)
   VALUES ('Conexion 360 SAC', NULL, NULL, 'gerencia@conexion360sac.com')
   ON CONFLICT DO NOTHING`,

  // Slide de ejemplo para el hero
  `INSERT INTO hero_slides (titulo, descripcion, imagen_desktop, imagen_mobile, orden, activo)
   VALUES ('Bienvenido a Conexion 360', 'Líderes en producción de eventos musicales', 
           'https://ik.imagekit.io/qpdyvnppk/hero-slides/ejemplo-desktop.jpg', 
           'https://ik.imagekit.io/qpdyvnppk/hero-slides/ejemplo-mobile.jpg', 1, true)
   ON CONFLICT DO NOTHING`,

  // Información para "Sobre Nosotros"
  `INSERT INTO sobre_nosotros (titulo, descripcion, imagen)
   VALUES ('Nuestra Pasión por la Música', 
           'Somos una empresa líder en la producción de eventos musicales en el Perú, con más de 10 años de experiencia creando experiencias memorables para los amantes de la música.', 
           'https://ik.imagekit.io/qpdyvnppk/about/ejemplo-nosotros.jpg')
   ON CONFLICT DO NOTHING`
];

// Función para ejecutar consultas SQL secuencialmente
async function executeQueries(queries) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    for (const query of queries) {
      await client.query(query);
    }
    
    await client.query('COMMIT');
    console.log('✅ Operación completada con éxito');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error durante la ejecución de las consultas:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Función principal para inicializar la base de datos
async function setupDatabase() {
  console.log('🚀 Iniciando configuración de la base de datos...');
  
  try {
    // Crear tablas
    console.log('📊 Creando tablas...');
    await executeQueries(createTablesQueries);
    console.log('✅ Tablas creadas o verificadas correctamente');
    
    // Insertar datos iniciales
    console.log('📝 Insertando datos iniciales...');
    await executeQueries(insertInitialDataQueries);
    console.log('✅ Datos iniciales insertados correctamente');
    
    console.log('🎉 ¡Base de datos configurada con éxito!');
  } catch (error) {
    console.error('❌ Error al configurar la base de datos:', error);
  } finally {
    await pool.end();
  }
}

// Ejecutar la configuración
setupDatabase();