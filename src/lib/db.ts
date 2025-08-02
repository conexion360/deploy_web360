// src/lib/db.ts
import { Pool } from 'pg';

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  user: 'postgres',
  password: '123456',
  host: 'localhost',
  port: 5432,
  database: 'conexion360',
  // Solo habilitar SSL en producción si es necesario
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Exportamos el pool para usarlo en los endpoints de API
export const db = pool;

// Función para comprobar la conexión a la base de datos
export async function checkDatabaseConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Conexión a la base de datos establecida:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    return false;
  }
}

// Función para ejecutar consultas SQL
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Ejecutada consulta', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Error ejecutando consulta', { text, error });
    throw error;
  }
}