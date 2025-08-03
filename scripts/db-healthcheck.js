// scripts/db-healthcheck.js
require('dotenv').config();
const { Pool } = require('pg');

// Log database connection attempt
console.log('Checking database connection...');
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

// Check database connection
const checkConnection = async () => {
  const client = await pool.connect();
  try {
    // Try to query the database
    const result = await client.query('SELECT NOW() as time');
    console.log('✅ Database connection successful!');
    console.log(`Server time: ${result.rows[0].time}`);
    
    // Check if the usuarios table exists and if the admin user exists
    try {
      const userResult = await client.query(
        "SELECT * FROM usuarios WHERE email = 'admin@conexion360sac.com'"
      );
      
      if (userResult.rows.length > 0) {
        console.log('✅ Admin user exists in the database');
        console.log(`   Username: ${userResult.rows[0].nombre}`);
        console.log(`   Email: ${userResult.rows[0].email}`);
        console.log(`   Role: ${userResult.rows[0].rol}`);
        console.log(`   Last login: ${userResult.rows[0].ultimo_acceso || 'Never'}`);
      } else {
        console.log('⚠️ Admin user does not exist. Run setup-db.js to create it.');
      }

      // Verify tables count
      const tablesResult = await client.query(`
        SELECT count(*) as table_count 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      console.log(`✅ Database has ${tablesResult.rows[0].table_count} tables`);

      // List all tables
      const tableListResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
      
      console.log('Tables in database:');
      tableListResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });

    } catch (err) {
      if (err.code === '42P01') { // undefined_table error code
        console.log('⚠️ Tables do not exist. Run setup-db.js to create them.');
      } else {
        throw err;
      }
    }
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
};

// Run the check
checkConnection().catch(err => {
  console.error('Failed to check database connection:', err);
  process.exit(1);
});