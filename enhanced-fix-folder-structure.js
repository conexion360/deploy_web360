// enhanced-fix-folder-structure.js
const fs = require('fs');
const path = require('path');

function ensureDirectoryExists(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    console.log(`Creando carpeta: ${directoryPath}`);
    fs.mkdirSync(directoryPath, { recursive: true });
    return true;
  }
  console.log(`La carpeta ya existe: ${directoryPath}`);
  return false;
}

function createPlaceholderFile(filePath, content = '') {
  if (!fs.existsSync(filePath)) {
    console.log(`Creando archivo: ${filePath}`);
    fs.writeFileSync(filePath, content);
    return true;
  }
  console.log(`El archivo ya existe: ${filePath}`);
  return false;
}

// Ruta base del proyecto
const basePath = process.cwd();

// Estructura de carpetas a verificar/crear
const folders = [
  path.join(basePath, 'public'),
  path.join(basePath, 'public', 'imagenes'),
  path.join(basePath, 'public', 'musicas'),
  path.join(basePath, 'public', 'imagenes', 'eventos'),
  path.join(basePath, 'public', 'imagenes', 'hero'),
  path.join(basePath, 'public', 'imagenes', 'covers'),
  path.join(basePath, 'public', 'imagenes', 'generos'),
  path.join(basePath, 'public', 'imagenes', 'galeria'),
  path.join(basePath, 'public', 'imagenes', 'nosotros')
];

// Crear placeholders para diferentes elementos del sitio
const placeholderContents = {
  logo: `
<!-- Archivo placeholder para el logo -->
<!-- Reemplazar con una imagen real -->
<!-- El logo debe tener un tamaño aproximado de 200x64px -->
  `,
  heroImage: `
<!-- Archivo placeholder para imágenes del carrusel hero -->
<!-- Las imágenes deben tener tamaños:
     - Desktop: 1920x1080px
     - Mobile: 768x1024px -->
  `,
  musicPlaceholder: `
<!-- Archivo placeholder para canciones -->
<!-- Sube archivos MP3 a esta carpeta -->
<!-- Los nombres deben coincidir con los registrados en la base de datos -->
  `,
  readme: `
# Carpetas para contenido dinámico

Este directorio contiene los archivos estáticos que se gestionan a través del panel de administración.

## Estructura:

- /imagenes - Todas las imágenes del sitio
  - /hero - Imágenes para el carrusel principal
  - /eventos - Fotos de eventos para la galería
  - /covers - Carátulas de canciones
  - /generos - Imágenes para géneros musicales
  - /nosotros - Imágenes para la sección "Sobre Nosotros"
  
- /musicas - Archivos de audio en formato MP3

## Importante:

No borres estas carpetas. Todos los archivos subidos a través del panel de administración
se guardarán en estas ubicaciones.
  `
};

// Crear archivos placeholder importantes
const files = [
  {
    path: path.join(basePath, 'public', 'README.md'),
    content: placeholderContents.readme
  },
  {
    path: path.join(basePath, 'public', 'musicas', 'README.md'),
    content: placeholderContents.musicPlaceholder
  },
  {
    path: path.join(basePath, 'public', 'imagenes', 'logo-placeholder.md'),
    content: placeholderContents.logo
  },
  {
    path: path.join(basePath, 'public', 'imagenes', 'hero', 'hero-placeholder.md'),
    content: placeholderContents.heroImage
  }
];

console.log('Verificando estructura de carpetas del proyecto...');

// Verificar y crear carpetas
folders.forEach(folder => {
  ensureDirectoryExists(folder);
});

// Verificar y crear archivos
files.forEach(file => {
  createPlaceholderFile(file.path, file.content || '');
});

// Crear un archivo MP3 de muestra si no existe ninguno
const sampleMp3Dir = path.join(basePath, 'public', 'musicas');
const mp3Files = fs.readdirSync(sampleMp3Dir).filter(file => file.endsWith('.mp3'));

if (mp3Files.length === 0) {
  console.log('\nNo se encontraron archivos MP3 en la carpeta musicas');
  console.log('Para que el reproductor funcione correctamente, debes:');
  console.log('1. Subir archivos MP3 a la carpeta /public/musicas');
  console.log('2. Registrar estos archivos en la base de datos usando el panel de administración');
  console.log('3. Marcar los archivos como "reproducible_web" y/o "destacado" para que aparezcan en el reproductor');
}

console.log('\nInstrucciones importantes:');
console.log('1. Debes colocar tu archivo conexion_logo.png en la carpeta /public/imagenes/');
console.log('2. Usa el panel de administración para gestionar todo el contenido del sitio');
console.log('3. Antes de iniciar el proyecto, asegúrate de que la base de datos esté configurada correctamente');

console.log('\nEstructura de carpetas verificada y corregida.');