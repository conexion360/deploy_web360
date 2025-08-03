// src/lib/db.ts
import { Pool } from 'pg';

// Mensaje informativo sobre la conexión a la base de datos
if (!process.env.DATABASE_URL) {
  console.error('⚠️ La variable DATABASE_URL no está definida en las variables de entorno');
  console.error('Por favor, configura esta variable en Railway o en tu archivo .env');
} else {
  // Ocultar información sensible en los logs
  const dbUrl = process.env.DATABASE_URL;
  const maskedUrl = dbUrl.replace(/\/\/[^:]+:[^@]+@/, '//****:****@');
  console.log('Conectando a base de datos con URL:', maskedUrl);
}

// Configuración del pool de conexiones
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Evento para detectar errores de conexión
pool.on('error', (err) => {
  console.error('Error inesperado en el cliente PostgreSQL:', err);
  // No cerramos el pool aquí para permitir reconexiones
});

// Exportamos el pool para usarlo en los endpoints de API
export const db = pool;

// Función para comprobar la conexión a la base de datos
export async function checkDatabaseConnection() {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Conexión a la base de datos establecida:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    return false;
  } finally {
    if (client) client.release();
  }
}

// Función para ejecutar consultas SQL con mejor manejo de errores
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  let client;
  try {
    client = await pool.connect();
    const res = await client.query(text, params);
    const duration = Date.now() - start;
    console.log('Ejecutada consulta', { 
      text: text.substring(0, 50) + (text.length > 50 ? '...' : ''), 
      duration, 
      rows: res.rowCount 
    });
    return res;
  } catch (error) {
    console.error('Error ejecutando consulta', { 
      text: text.substring(0, 50) + (text.length > 50 ? '...' : ''), 
      error 
    });
    throw error;
  } finally {
    if (client) client.release();
  }
}