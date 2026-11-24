const pool = require('../db');
const { ErrorApp } = require('../middlewares/errores');
const { paginar, respuesta } = require('../utils/paginacion');

const redondear = (n) => Math.round(n * 100) / 100;

// Reservación con el nombre del huésped y sus habitaciones
async function obtenerCompleta(id) {
  const [filas] = await pool.query(
    `SELECT r.*, CONCAT(hu.nombre, ' ', hu.apellido) AS huesped, hu.dni AS huesped_dni
     FROM reservaciones r
     JOIN huespedes hu ON hu.id = r.huesped_id
     WHERE r.id = ?`, [id]);
  if (filas.length === 0) return null;
  const [detalle] = await pool.query(
    `SELECT d.habitacion_id, h.numero, d.precio_noche, d.noches, d.subtotal
     FROM reservacion_detalle d
     JOIN habitaciones h ON h.id = d.habitacion_id
     WHERE d.reservacion_id = ?
     ORDER BY h.numero`, [id]);
  return { ...filas[0], detalle };
}

async function listar(req, res) {
  const { pagina, limite, offset } = paginar(req.query);

  const where = [];
  const valores = [];
  if (req.query.estado) { where.push('r.estado = ?'); valores.push(req.query.estado); }
  if (req.query.huesped_id) { where.push('r.huesped_id = ?'); valores.push(Number(req.query.huesped_id)); }
  if (req.query.fecha_desde) { where.push('r.fecha_entrada >= ?'); valores.push(req.query.fecha_desde); }
  if (req.query.fecha_hasta) { where.push('r.fecha_salida <= ?'); valores.push(req.query.fecha_hasta); }
  const condicion = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM reservaciones r ${condicion}`, valores);
  const [datos] = await pool.query(
    `SELECT r.*, CONCAT(hu.nombre, ' ', hu.apellido) AS huesped
     FROM reservaciones r
     JOIN huespedes hu ON hu.id = r.huesped_id
     ${condicion}
     ORDER BY r.fecha_entrada DESC, r.id DESC
     LIMIT ? OFFSET ?`,
    [...valores, limite, offset]);

  res.json(respuesta(datos, total, pagina, limite));
}

async function obtener(req, res) {
  const reserva = await obtenerCompleta(req.params.id);
  if (!reserva) throw new ErrorApp(404, 'NO_ENCONTRADO', 'Reservación no encontrada');
  res.json(reserva);
}

async function crear(req, res) {
  const { huesped_id, usuario_id, fecha_entrada, fecha_salida } = req.body;
  const ids = [...new Set(req.body.habitaciones)]; // quita habitaciones repetidas

  const [huesped] = await pool.query('SELECT id FROM huespedes WHERE id = ?', [huesped_id]);
  if (huesped.length === 0) throw new ErrorApp(404, 'NO_ENCONTRADO', 'Huésped no encontrado');

  const [usuario] = await pool.query(
    'SELECT id FROM usuarios WHERE id = ? AND activo = 1', [usuario_id]);
  if (usuario.length === 0) throw new ErrorApp(404, 'NO_ENCONTRADO', 'Usuario no encontrado');

 
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [habs] = await conn.query(
      `SELECT h.id, t.precio_noche
       FROM habitaciones h
       JOIN tipos_habitacion t ON t.id = h.tipo_habitacion_id
       WHERE h.id IN (?)
       FOR UPDATE OF h`, [ids]);
    if (habs.length !== ids.length) {
      throw new ErrorApp(404, 'NO_ENCONTRADO', 'Alguna habitación no existe');
    }

    const [ocupadas] = await conn.query(
      `SELECT DISTINCT d.habitacion_id
       FROM reservacion_detalle d
       JOIN reservaciones r ON r.id = d.reservacion_id
       WHERE d.habitacion_id IN (?)
         AND r.estado = 'activa'
         AND r.fecha_entrada < ?
         AND r.fecha_salida > ?`,
      [ids, fecha_salida, fecha_entrada]);
    if (ocupadas.length > 0) {
      throw new ErrorApp(409, 'NO_DISPONIBLE', 'Habitaciones no disponibles en esas fechas',
        ocupadas.map((o) => ({ campo: 'habitaciones', mensaje: `La habitación ${o.habitacion_id} está ocupada` })));
    }

    const [[{ noches }]] = await conn.query(
      'SELECT DATEDIFF(?, ?) AS noches', [fecha_salida, fecha_entrada]);
    const detalle = habs.map((h) => [h.id, h.precio_noche, noches, redondear(h.precio_noche * noches)]);
    const total = redondear(detalle.reduce((suma, d) => suma + d[3], 0));

    const [r] = await conn.query(
      `INSERT INTO reservaciones (huesped_id, usuario_id, fecha_entrada, fecha_salida, total)
       VALUES (?, ?, ?, ?, ?)`,
      [huesped_id, usuario_id, fecha_entrada, fecha_salida, total]);
    await conn.query(
      `INSERT INTO reservacion_detalle (reservacion_id, habitacion_id, precio_noche, noches, subtotal)
       VALUES ?`,
      [detalle.map((d) => [r.insertId, ...d])]);

    await conn.commit();
    res.status(201).json(await obtenerCompleta(r.insertId));
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release(); 
  }
}

async function cambiarEstado(req, res, nuevoEstado, accion) {
  const [r] = await pool.query(
    "UPDATE reservaciones SET estado = ? WHERE id = ? AND estado = 'activa'",
    [nuevoEstado, req.params.id]);
  if (r.affectedRows === 0) {
    const [existe] = await pool.query('SELECT estado FROM reservaciones WHERE id = ?', [req.params.id]);
    if (existe.length === 0) throw new ErrorApp(404, 'NO_ENCONTRADO', 'Reservación no encontrada');
    throw new ErrorApp(409, 'ESTADO_INVALIDO',
      `Solo se puede ${accion} una reservación activa (estado actual: ${existe[0].estado})`);
  }
  res.json(await obtenerCompleta(req.params.id));
}

const cancelar = (req, res) => cambiarEstado(req, res, 'cancelada', 'cancelar');
const finalizar = (req, res) => cambiarEstado(req, res, 'finalizada', 'finalizar');

async function eliminar(req, res) {
  const [r] = await pool.query('DELETE FROM reservaciones WHERE id = ?', [req.params.id]);
  if (r.affectedRows === 0) throw new ErrorApp(404, 'NO_ENCONTRADO', 'Reservación no encontrada');
  res.status(204).end();
}

module.exports = { listar, obtener, crear, cancelar, finalizar, eliminar };