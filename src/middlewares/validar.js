const { validationResult } = require('express-validator');

module.exports = function validar(req, res, next) {
  const errores = validationResult(req);
  if (errores.isEmpty()) return next();
  res.status(400).json({
    error: {
      codigo: 'VALIDACION',
      mensaje: 'Datos inválidos',
      detalles: errores.array().map((e) => ({ campo: e.path, mensaje: e.msg })),
    },
  });
};