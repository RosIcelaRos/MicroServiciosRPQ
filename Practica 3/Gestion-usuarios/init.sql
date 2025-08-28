-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS usuarios_db;
USE usuarios_db;

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_fecha_registro (fecha_registro)
);

-- Insertar algunos datos de ejemplo
INSERT INTO usuarios (nombre, email) VALUES 
('Juan Pérez', 'juan.perez@email.com'),
('María García', 'maria.garcia@email.com'),
('Carlos López', 'carlos.lopez@email.com'),
('Ana Martínez', 'ana.martinez@email.com'),
('Luis Rodríguez', 'luis.rodriguez@email.com')
ON DUPLICATE KEY UPDATE nombre=nombre;