const pool = require('../db');
const { ErrorApp } = require('../middlewares/errores');
const { paginar, respuesta } = require('../utils/paginacion');

async function buscar(id) {
  const [filas] = await pool.query('SELECT * FROM huespedes WHERE id = ?', [id]);
  return filas[0];
}

async function listar(req, res) {
  const { pagina, limite, offset } = paginar(req.query);

  const where = [];
  const valores = [];
  if (req.query.nombre) { where.push('nombre LIKE ?'); valores.push(`%${req.query.nombre}%`); }
  if (req.query.apellido) { where.push('apellido LIKE ?'); valores.push(`%${req.query.apellido}%`); }
  if (req.query.dni) { where.push('dni = ?'); valores.push(req.query.dni); }
  const condicion = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM huespedes ${condicion}`, valores);
  const [datos] = await pool.query(
    `SELECT * FROM huespedes ${condicion} ORDER BY apellido, nombre LIMIT ? OFFSET ?`,
    [...valores, limite, offset]);

  res.json(respuesta(datos, total, pagina, limite));
}

async function obtener(req, res) {
  const fila = await buscar(req.params.id);
  if (!fila) throw new ErrorApp(404, 'NO_ENCONTRADO', 'Huésped no encontrado');
  res.json(fila);
}

async function crear(req, res) {
  const { nombre, apellido, dni, telefono = null, correo = null } = req.body;
  const [r] = await pool.query(
    'INSERT INTO huespedes (nombre, apellido, dni, telefono, correo) VALUES (?, ?, ?, ?, ?)',
    [nombre, apellido, dni, telefono, correo]);
  res.status(201).json(await buscar(r.insertId));
}

async function actualizar(req, res) {
  const { nombre, apellido, dni, telefono = null, correo = null } = req.body;
  await pool.query(
    `UPDATE huespedes
     SET nombre = ?, apellido = ?, dni = ?, telefono = ?, correo = ?
     WHERE id = ?`,
    [nombre, apellido, dni, telefono, correo, req.params.id]);
  const fila = await buscar(req.params.id);
  if (!fila) throw new ErrorApp(404, 'NO_ENCONTRADO', 'Huésped no encontrado');
  res.json(fila);
}

async function eliminar(req, res) {
  // Un huésped con reservaciones no se puede borrar: el manejador responde 409
  const [r] = await pool.query('DELETE FROM huespedes WHERE id = ?', [req.params.id]);
  if (r.affectedRows === 0) throw new ErrorApp(404, 'NO_ENCONTRADO', 'Huésped no encontrado');
  res.status(204).end();
}

module.exports = { listar, obtener, crear, actualizar, eliminar };