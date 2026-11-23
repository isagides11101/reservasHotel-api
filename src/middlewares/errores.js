class ErrorApp extends Error {
  constructor(estado, codigo, mensaje, detalles) {
    super(mensaje);
    this.estado = estado;
    this.codigo = codigo;
    this.detalles = detalles;
  }
}

function formato(res, estado, codigo, mensaje, detalles) {
  const error = { codigo, mensaje };
  if (detalles) error.detalles = detalles;
  return res.status(estado).json({ error });
}

function noEncontrado(req, res) {
  formato(res, 404, 'RUTA_NO_ENCONTRADA', 'Ruta no encontrada');
}

function manejadorErrores(err, req, res, next) {
  if (err instanceof ErrorApp) return formato(res, err.estado, err.codigo, err.message, err.detalles);
  if (err.type === 'entity.parse.failed') return formato(res, 400, 'JSON_INVALIDO', 'El cuerpo no es un JSON válido');
  // Errores de MySQL traducidos
  if (err.code === 'ER_DUP_ENTRY') return formato(res, 409, 'DUPLICADO', 'Ya existe un registro con ese valor');
  if (err.code === 'ER_ROW_IS_REFERENCED_2') return formato(res, 409, 'EN_USO', 'No se puede eliminar: tiene registros relacionados');
  if (err.code === 'ER_NO_REFERENCED_ROW_2') return formato(res, 400, 'REFERENCIA_INVALIDA', 'Hace referencia a un registro que no existe');
  console.error(err);
  formato(res, 500, 'ERROR_SERVIDOR', 'Error del servidor');
}

module.exports = { ErrorApp, noEncontrado, manejadorErrores };