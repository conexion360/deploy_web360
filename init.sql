-- Tabla de usuarios para el panel de administración
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'admin' NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP
);

-- Tabla para la sección Hero (carrusel principal)
CREATE TABLE IF NOT EXISTS hero_slides (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100),
    descripcion TEXT,
    imagen_desktop VARCHAR(255) NOT NULL,
    imagen_mobile VARCHAR(255) NOT NULL,
    orden INT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para la sección Sobre Nosotros
CREATE TABLE IF NOT EXISTS sobre_nosotros (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    imagen VARCHAR(255) NOT NULL,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para características de la sección Sobre Nosotros
CREATE TABLE IF NOT EXISTS caracteristicas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    icono VARCHAR(50),
    sobre_nosotros_id INT REFERENCES sobre_nosotros(id) ON DELETE CASCADE,
    orden INT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para estadísticas de la sección Sobre Nosotros
CREATE TABLE IF NOT EXISTS estadisticas (
    id SERIAL PRIMARY KEY,
    valor VARCHAR(20) NOT NULL,
    descripcion VARCHAR(100) NOT NULL,
    orden INT NOT NULL,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para la galería de imágenes
CREATE TABLE IF NOT EXISTS galeria (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    imagen VARCHAR(255) NOT NULL,
    thumbnail VARCHAR(255),
    orden INT NOT NULL,
    categoria VARCHAR(50),
    destacado BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para géneros musicales
CREATE TABLE IF NOT EXISTS generos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    imagen VARCHAR(255) NOT NULL,
    icono VARCHAR(50),
    orden INT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para la biblioteca de música
CREATE TABLE IF NOT EXISTS musica (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    artista VARCHAR(100),
    archivo VARCHAR(255) NOT NULL,
    imagen_cover VARCHAR(255),
    genero_id INT REFERENCES generos(id) ON DELETE SET NULL,
    destacado BOOLEAN DEFAULT FALSE,
    reproducible_web BOOLEAN DEFAULT TRUE,
    orden INT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para redes sociales
CREATE TABLE IF NOT EXISTS redes_sociales (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    url VARCHAR(255) NOT NULL,
    icono VARCHAR(255) NOT NULL,
    username VARCHAR(100),
    color VARCHAR(50),
    orden INT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para mensajes de contacto
CREATE TABLE IF NOT EXISTS mensajes_contacto (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    mensaje TEXT NOT NULL,
    leido BOOLEAN DEFAULT FALSE,
    respondido BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_lectura TIMESTAMP,
    fecha_respuesta TIMESTAMP
);

-- Tabla para la configuración general del sitio
CREATE TABLE IF NOT EXISTS configuracion (
    id SERIAL PRIMARY KEY,
    nombre_sitio VARCHAR(100) NOT NULL,
    logo VARCHAR(255),
    favicon VARCHAR(255),
    email_contacto VARCHAR(100),
    telefono VARCHAR(20),
    direccion TEXT,
    footer_texto TEXT,
    facebook VARCHAR(255),
    instagram VARCHAR(255),
    tiktok VARCHAR(255),
    youtube VARCHAR(255),
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para logs del sistema
CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id) ON DELETE SET NULL,
    accion VARCHAR(255) NOT NULL,
    tabla VARCHAR(50),
    registro_id INT,
    datos JSONB,
    ip VARCHAR(45),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserta un usuario administrador por defecto (password: admin123)
INSERT INTO usuarios (nombre, email, password, rol) 
VALUES ('Administrador', 'admin@conexion360sac.com', '$2a$10$Ck6VzMRWF8bF7nUXFU9JzeQLVk1PEsKrFS7Azlb0xNz3S9FQUn.Ra', 'superadmin')
ON CONFLICT (email) DO NOTHING;

-- Insertar configuración inicial del sitio
INSERT INTO configuracion (nombre_sitio, email_contacto, footer_texto) 
VALUES ('Conexion 360 SAC', 'gerencia@conexion360sac.com', '© 2025 Conexion 360 SAC. Todos los derechos reservados.')
ON CONFLICT DO NOTHING;