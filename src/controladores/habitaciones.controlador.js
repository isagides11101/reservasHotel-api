const pool = require('../db');
const { ErrorApp } = require('../middlewares/errores');
const { paginar, respuesta } = require('../utils/paginacion');

const SELECT = `
  SELECT h.id, h.numero, h.piso, h.estado, h.tipo_habitacion_id,
         t.nombre AS tipo, t.capacidad, t.precio_noche
  FROM habitaciones h
  JOIN tipos_habitacion t ON t.id = h.tipo_habitacion_id`;

async function buscar(id) {
  const [filas] = await pool.query(`${SELECT} WHERE h.id = ?`, [id]);
  return filas[0]; 
}

async function listar(req, res) {
  const { pagina, limite, offset } = paginar(req.query);

  const where = [];
  const valores = [];
  if (req.query.estado) { where.push('h.estado = ?'); valores.push(req.query.estado); }
  if (req.query.piso) { where.push('h.piso = ?'); valores.push(Number(req.query.piso)); }
  if (req.query.tipo_habitacion_id) {
    where.push('h.tipo_habitacion_id = ?');
    valores.push(Number(req.query.tipo_habitacion_id));
  }
  if (req.query.numero) { where.push('h.numero LIKE ?'); valores.push(`%${req.query.numero}%`); }
  const condicion = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM habitaciones h ${condicion}`, valores);
  const [datos] = await pool.query(
    `${SELECT} ${condicion} ORDER BY h.numero LIMIT ? OFFSET ?`,
    [...valores, limite, offset]);

  res.json(respuesta(datos, total, pagina, limite));
}

async function obtener(req, res) {
  const fila = await buscar(req.params.id);
  if (!fila) throw new ErrorApp(404, 'NO_ENCONTRADO', 'Habitación no encontrada');
  res.json(fila);
}

async function crear(req, res) {
  const { numero, tipo_habitacion_id, piso, estado = 'libre' } = req.body;
  const [r] = await pool.query(
    'INSERT INTO habitaciones (numero, tipo_habitacion_id, piso, estado) VALUES (?, ?, ?, ?)',
    [numero, tipo_habitacion_id, piso, estado]);
  res.status(201).json(await buscar(r.insertId));
}

async function actualizar(req, res) {
  const { numero, tipo_habitacion_id, piso, estado } = req.body;
  await pool.query(
    `UPDATE habitaciones
     SET numero = ?, tipo_habitacion_id = ?, piso = ?, estado = COALESCE(?, estado)
     WHERE id = ?`,
    [numero, tipo_habitacion_id, piso, estado ?? null, req.params.id]);
  const fila = await buscar(req.params.id);
  if (!fila) throw new ErrorApp(404, 'NO_ENCONTRADO', 'Habitación no encontrada');
  res.json(fila);
}

async function cambiarEstado(req, res) {
  await pool.query('UPDATE habitaciones SET estado = ? WHERE id = ?',
    [req.body.estado, req.params.id]);
  const fila = await buscar(req.params.id);
  if (!fila) throw new ErrorApp(404, 'NO_ENCONTRADO', 'Habitación no encontrada');
  res.json(fila);
}

async function eliminar(req, res) {
  const [r] = await pool.query('DELETE FROM habitaciones WHERE id = ?', [req.params.id]);
  if (r.affectedRows === 0) throw new ErrorApp(404, 'NO_ENCONTRADO', 'Habitación no encontrada');
  res.status(204).end();
}

module.exports = { listar, obtener, crear, actualizar, cambiarEstado, eliminar };