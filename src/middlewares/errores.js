function noEncontrado(req, res) {
  res.status(404).json({ error: 'Ruta no encontrada' });
}

function manejadorErrores(err, req, res, next) {
  console.error(err);
  res.status(500).json({ error: 'Error del servidor' });
}

module.exports = { noEncontrado, manejadorErrores };