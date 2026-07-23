-- ============================================================
-- MARTEX DATABASE SCHEMA (Compatible 100% con MySQL Workbench)
-- ============================================================

CREATE DATABASE IF NOT EXISTS martex_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE martex_db;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS detalle_pedidos;
DROP TABLE IF EXISTS pedidos;
DROP TABLE IF EXISTS medidas;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS usuarios;

SET FOREIGN_KEY_CHECKS = 1;

-- TABLA: usuarios
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  google_id VARCHAR(255) DEFAULT NULL,
  nombre VARCHAR(150) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  password_hash VARCHAR(255) DEFAULT NULL,
  rol ENUM('cliente', 'admin') NOT NULL DEFAULT 'cliente',
  fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_usuarios_email (email),
  INDEX idx_usuarios_rol (rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA: productos
CREATE TABLE productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT,
  categoria ENUM('medico', 'belleza') NOT NULL DEFAULT 'medico',
  precio DECIMAL(10,2) NOT NULL,
  imagen_url VARCHAR(500) DEFAULT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_productos_categoria (categoria),
  INDEX idx_productos_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA: medidas (15 Parámetros de sastrería)
CREATE TABLE medidas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_nombre VARCHAR(200) NOT NULL,
  telefono VARCHAR(20) DEFAULT NULL,
  tipo_prenda ENUM('filipina', 'pantalon', 'ambos') NOT NULL,
  
  -- Medidas Filipina / Gabacha / Top
  hombro DECIMAL(5,2) DEFAULT NULL,
  busto DECIMAL(5,2) DEFAULT NULL,
  cintura_top DECIMAL(5,2) DEFAULT NULL,
  cadera_top DECIMAL(5,2) DEFAULT NULL,
  largo_cintura DECIMAL(5,2) DEFAULT NULL,
  manga_largo DECIMAL(5,2) DEFAULT NULL,
  grosor_brazo DECIMAL(5,2) DEFAULT NULL,
  largo_total_top DECIMAL(5,2) DEFAULT NULL,
  
  -- Medidas Pantalón
  cintura_pant DECIMAL(5,2) DEFAULT NULL,
  cadera_pant DECIMAL(5,2) DEFAULT NULL,
  largo_rodilla DECIMAL(5,2) DEFAULT NULL,
  largo_total_pant DECIMAL(5,2) DEFAULT NULL,
  grosor_muslo DECIMAL(5,2) DEFAULT NULL,
  tiro DECIMAL(5,2) DEFAULT NULL,
  grosor_rodilla DECIMAL(5,2) DEFAULT NULL,
  
  notas TEXT,
  fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_medidas_cliente (cliente_nombre),
  INDEX idx_medidas_tipo (tipo_prenda)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA: pedidos
CREATE TABLE pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT DEFAULT NULL,
  cliente_nombre VARCHAR(200) NOT NULL,
  dui VARCHAR(20) NOT NULL,
  direccion TEXT NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  metodo_pago ENUM('efectivo', 'transferencia') NOT NULL DEFAULT 'efectivo',
  total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  estado ENUM('pendiente', 'completado') NOT NULL DEFAULT 'pendiente',
  fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pedidos_usuarios FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_pedidos_estado (estado),
  INDEX idx_pedidos_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA: detalle_pedidos
CREATE TABLE detalle_pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_detalle_pedidos_pedidos FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  CONSTRAINT fk_detalle_pedidos_productos FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT,
  INDEX idx_detalle_pedido (pedido_id),
  INDEX idx_detalle_producto (producto_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DATOS SEMILLA
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
('Administrador Martex', 'admin@martex.com', '$2a$10$LGpWem4lrGndvE4qDXY58OVzN05mdIfezVq5JAGz//XZMzUrdzPhG', 'admin');

INSERT INTO productos (titulo, descripcion, categoria, precio, imagen_url) VALUES
('Abrigo Médico Profesional', 'Abrigo médico de alta calidad, ideal para profesionales de la salud. Confeccionado con tela resistente y cómoda para largas jornadas.', 'medico', 35.00, '/imagenes/Abrigo médico.jpeg'),
('Scrub Verde Esmeralda', 'Camisa tipo scrub en color verde esmeralda. Tela suave, transpirable y de fácil lavado. Perfecta para clínicas y hospitales.', 'medico', 22.00, '/imagenes/Camisa (scrug) color  verde esmeralda.jpeg'),
('Camisa Uniforme Gris', 'Camisa de uniforme en color gris sobrio y elegante. Ideal para consultorios y laboratorios. Acabado profesional.', 'medico', 20.00, '/imagenes/Camisa de uniforme color gris.jpeg'),
('Scrub Azul Clásico', 'Camisa scrub en color azul clásico, el favorito del sector médico. Cómoda, duradera y de fácil mantenimiento.', 'medico', 22.00, '/imagenes/Camisa(scrub)colorAzul.jpeg'),
('Conjunto Uniforme Médico Completo', 'Set completo de uniforme médico: camisa y pantalón a juego. Confección premium con 8 años de experiencia Martex.', 'medico', 45.00, '/imagenes/conjunto de uniforme médico.jpeg');
