// Este script ejecuta el SQL a través de la API de Railway
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');

// Leer el archivo SQL
const sqlFile = path.join(__dirname, 'init.sql');
const sqlContent = fs.readFileSync(sqlFile, 'utf8');

// Crear un archivo temporal para el SQL
const tempFile = path.join(os.tmpdir(), 'railway-sql-temp.sql');
fs.writeFileSync(tempFile, sqlContent);

// Comando para ejecutar SQL a través de Railway
const command = `railway run "psql -f ${tempFile.replace(/\\/g, '\\\\')}"`;

console.log('Ejecutando SQL a través de Railway API...');
console.log('Comando:', command);

// Ejecutar el comando
exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.log('¡SQL ejecutado correctamente!');
  
  // Eliminar el archivo temporal
  fs.unlinkSync(tempFile);
});