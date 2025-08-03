// db-healthcheck.js
require('dotenv').config();
const { Pool } = require('pg');

// Función para verificar la conexión a la base de datos
async function checkDatabaseConnection() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: La variable DATABASE_URL no está definida');
    console.error('Por favor, configura esta variable en el archivo .env o en las variables de entorno');
    return false;
  }

  // Ocultar información sensible en los logs
  const dbUrl = process.env.DATABASE_URL;
  const maskedUrl = dbUrl.replace(/\/\/[^:]+:[^@]+@/, '//****:****@');
  console.log('Intentando conectar a la base de datos con URL:', maskedUrl);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    // Tiempo de espera de conexión reducido para diagnóstico rápido
    connectionTimeoutMillis: 5000
  });

  let client;
  try {
    console.log('Obteniendo conexión del pool...');
    client = await pool.connect();
    
    console.log('Ejecutando consulta de prueba...');
    const result = await client.query('SELECT NOW() as time, current_database() as database, version() as version');
    
    console.log('\n✅ CONEXIÓN EXITOSA A LA BASE DE DATOS');
    console.log('----------------------------------------');
    console.log(`Tiempo del servidor: ${result.rows[0].time}`);
    console.log(`Base de datos: ${result.rows[0].database}`);
    console.log(`Versión de PostgreSQL: ${result.rows[0].version}`);
    
    // Verificar tablas existentes
    console.log('\nVerificando tablas en la base de datos...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('⚠️ No se encontraron tablas en la base de datos');
      console.log('Debes ejecutar el script setup-db.js para crear las tablas necesarias');
    } else {
      console.log(`Encontradas ${tablesResult.rows.length} tablas:`);
      tablesResult.rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.table_name}`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('\n❌ ERROR AL CONECTAR CON LA BASE DE DATOS');
    console.error('----------------------------------------');
    console.error('Detalles del error:', error);
    
    // Diagnóstico adicional
    console.error('\nPosibles causas y soluciones:');
    if (error.code === 'ECONNREFUSED') {
      console.error('- El servidor de base de datos no está disponible o la dirección/puerto es incorrecta');
      console.error('- Verifica que la URL de conexión sea correcta');
      console.error('- Asegúrate de que el servidor PostgreSQL esté en ejecución');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('- Tiempo de espera agotado al intentar conectar');
      console.error('- Verifica la conectividad de red');
      console.error('- Comprueba que no haya reglas de firewall bloqueando la conexión');
    } else if (error.code === '28P01') {
      console.error('- Autenticación fallida: contraseña incorrecta');
      console.error('- Verifica las credenciales en la URL de conexión');
    } else if (error.code === '3D000') {
      console.error('- La base de datos especificada no existe');
      console.error('- Crea la base de datos o verifica el nombre en la URL de conexión');
    }
    
    return false;
  } finally {
    if (client) {
      console.log('Liberando conexión...');
      client.release();
    }
    await pool.end();
  }
}

// Ejecutar la verificación
checkDatabaseConnection().then(success => {
  if (success) {
    console.log('\n✨ La conexión a la base de datos funciona correctamente');
    process.exit(0);
  } else {
    console.error('\n❌ No se pudo establecer la conexión a la base de datos');
    process.exit(1);
  }
});