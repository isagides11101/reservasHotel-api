const pool = require('../db');
const { ErrorApp } = require('../middlewares/errores');
const { paginar, respuesta } = require('../utils/paginacion');

async function listar(req, res) {
  const { pagina, limite, offset } = paginar(req.query);

  // El WHERE se arma con texto fijo; los valores siempre van aparte con ?
  const where = [];
  const valores = [];
  if (req.query.nombre) { where.push('nombre LIKE ?'); valores.push(`%${req.query.nombre}%`); }
  if (req.query.capacidad) { where.push('capacidad >= ?'); valores.push(Number(req.query.capacidad)); }
  const condicion = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM tipos_habitacion ${condicion}`, valores);
  const [datos] = await pool.query(
    `SELECT * FROM tipos_habitacion ${condicion} ORDER BY id LIMIT ? OFFSET ?`,
    [...valores, limite, offset]);

  res.json(respuesta(datos, total, pagina, limite));
}

async function obtener(req, res) {
  const [filas] = await pool.query('SELECT * FROM tipos_habitacion WHERE id = ?', [req.params.id]);
  if (filas.length === 0) throw new ErrorApp(404, 'NO_ENCONTRADO', 'Tipo de habitación no encontrado');
  res.json(filas[0]);
}

async function crear(req, res) {
  const { nombre, descripcion = null, capacidad, precio_noche } = req.body;
  const [r] = await pool.query(
    'INSERT INTO tipos_habitacion (nombre, descripcion, capacidad, precio_noche) VALUES (?, ?, ?, ?)',
    [nombre, descripcion, capacidad, precio_noche]);
  res.status(201).json({ id: r.insertId, nombre, descripcion, capacidad, precio_noche });
}

async function actualizar(req, res) {
  const { nombre, descripcion = null, capacidad, precio_noche } = req.body;
  const [r] = await pool.query(
    'UPDATE tipos_habitacion SET nombre = ?, descripcion = ?, capacidad = ?, precio_noche = ? WHERE id = ?',
    [nombre, descripcion, capacidad, precio_noche, req.params.id]);
  if (r.affectedRows === 0) throw new ErrorApp(404, 'NO_ENCONTRADO', 'Tipo de habitación no encontrado');
  res.json({ id: Number(req.params.id), nombre, descripcion, capacidad, precio_noche });
}

async function eliminar(req, res) {
  const [r] = await pool.query('DELETE FROM tipos_habitacion WHERE id = ?', [req.params.id]);
  if (r.affectedRows === 0) throw new ErrorApp(404, 'NO_ENCONTRADO', 'Tipo de habitación no encontrado');
  res.status(204).end();
}

module.exports = { listar, obtener, crear, actualizar, eliminar };