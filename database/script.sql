CREATE DATABASE IF NOT EXISTS hotel_db;
USE hotel_db;

SET NAMES utf8mb4;

DROP TABLE IF EXISTS reservacion_detalle;
DROP TABLE IF EXISTS reservaciones;
DROP TABLE IF EXISTS habitaciones;
DROP TABLE IF EXISTS huespedes;
DROP TABLE IF EXISTS tipos_habitacion;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('admin','operador') NOT NULL DEFAULT 'operador',
  activo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tipos_habitacion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(60) NOT NULL UNIQUE,
  descripcion VARCHAR(255),
  capacidad INT NOT NULL DEFAULT 1,
  precio_noche DECIMAL(10,2) NOT NULL
);

CREATE TABLE huespedes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  apellido VARCHAR(80) NOT NULL,
  dni VARCHAR(20) NOT NULL UNIQUE,
  telefono VARCHAR(20),
  correo VARCHAR(120),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE habitaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero VARCHAR(10) NOT NULL UNIQUE,
  tipo_habitacion_id INT NOT NULL,
  piso INT NOT NULL,
  estado ENUM('libre','ocupada','limpieza') NOT NULL DEFAULT 'libre',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tipo_habitacion_id) REFERENCES tipos_habitacion(id)
);

CREATE TABLE reservaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  huesped_id INT NOT NULL,
  usuario_id INT NOT NULL,
  fecha_entrada DATE NOT NULL,
  fecha_salida DATE NOT NULL,
  estado ENUM('activa','finalizada','cancelada') NOT NULL DEFAULT 'activa',
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (huesped_id) REFERENCES huespedes(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CHECK (fecha_salida > fecha_entrada)
);

CREATE TABLE reservacion_detalle (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reservacion_id INT NOT NULL,
  habitacion_id INT NOT NULL,
  precio_noche DECIMAL(10,2) NOT NULL,
  noches INT NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (reservacion_id) REFERENCES reservaciones(id) ON DELETE CASCADE,
  FOREIGN KEY (habitacion_id) REFERENCES habitaciones(id)
);

CREATE INDEX idx_hab_estado ON habitaciones(estado);
CREATE INDEX idx_res_fechas ON reservaciones(fecha_entrada, fecha_salida);

INSERT INTO tipos_habitacion (nombre, descripcion, capacidad, precio_noche) VALUES
  ('Sencilla', 'Una cama individual', 1, 800),
  ('Doble', 'Dos camas individuales', 2, 1200),
  ('Matrimonial', 'Una cama matrimonial', 2, 1400),
  ('Suite', 'Suite con sala', 4, 2500);

INSERT INTO habitaciones (numero, tipo_habitacion_id, piso) VALUES
  ('101', 1, 1), ('102', 1, 1), ('103', 2, 1),
  ('201', 2, 2), ('202', 3, 2), ('203', 3, 2),
  ('301', 4, 3), ('302', 4, 3);