// scripts/configure-imagekit.js
require('dotenv').config();
const ImageKit = require('imagekit');

// Verificar la configuración de variables de entorno
console.log('Verificando configuración de ImageKit...');
console.log(`NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY: ${process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ? '✓ Configurada' : '✗ Faltante'}`);
console.log(`IMAGEKIT_PRIVATE_KEY: ${process.env.IMAGEKIT_PRIVATE_KEY ? '✓ Configurada' : '✗ Faltante'}`);
console.log(`NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: ${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ? '✓ Configurada' : '✗ Faltante'}`);

// Configuración de ImageKit
if (!process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT) {
  console.error('ERROR: Faltan variables de entorno para ImageKit.');
  console.error('Por favor, configura NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY y NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT en tu archivo .env');
  process.exit(1);
}

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
});

// Verificar la conexión con ImageKit
const testConnection = async () => {
  try {
    console.log('Verificando conexión con ImageKit...');
    
    // En lugar de getAccountDetails (que no existe), usamos listFiles para verificar la conexión
    const files = await imagekit.listFiles({
      limit: 1
    });
    
    console.log('✅ Conexión con ImageKit exitosa!');
    
    // Listar las carpetas existentes
    console.log('\nListando carpetas en ImageKit...');
    const folders = await imagekit.listFiles({
      type: 'folder',
      limit: 10
    });
    
    console.log('Carpetas encontradas:');
    if (folders.length === 0) {
      console.log('   No se encontraron carpetas');
    } else {
      folders.forEach(folder => {
        console.log(`   - ${folder.name}`);
      });
    }
    
    // Crear carpetas necesarias si no existen
    const requiredFolders = [
      'hero-slides',
      'gallery',
      'about',
      'genres',
      'music-covers',
      'music-files',
      'site-assets'
    ];
    
    console.log('\nVerificando carpetas necesarias...');
    const existingFolderNames = folders.map(f => f.name);
    
    for (const folderName of requiredFolders) {
      if (!existingFolderNames.includes(folderName)) {
        console.log(`   Creando carpeta: ${folderName}`);
        try {
          await imagekit.createFolder({
            folderName: folderName,
            parentFolderPath: '/'
          });
          console.log(`   ✅ Carpeta ${folderName} creada correctamente`);
        } catch (err) {
          console.error(`   ❌ Error al crear carpeta ${folderName}:`, err.message);
        }
      } else {
        console.log(`   ✓ Carpeta ${folderName} ya existe`);
      }
    }
    
    console.log('\n✅ Configuración de ImageKit completada correctamente!');
    
  } catch (error) {
    console.error('❌ Error al conectar con ImageKit:', error);
    console.log('\nPosibles soluciones:');
    console.log('1. Verifica que las claves de API de ImageKit sean correctas');
    console.log('2. Asegúrate de que tu cuenta de ImageKit esté activa');
    console.log('3. Comprueba tu conexión a internet');
    
    // Verificar si el error es de autenticación
    if (error.message && error.message.includes('authentication')) {
      console.log('\n⚠️ Error de autenticación detectado. Asegúrate de que tus claves de API sean correctas.');
    }
  }
};

// Ejecutar la verificación
testConnection().finally(() => {
  console.log('Finalizado el proceso de verificación de ImageKit.');
});