const { body, param, query } = require('express-validator');

const id = [param('id').isInt({ min: 1 }).withMessage('El id debe ser un entero positivo')];

const cuerpo = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ max: 60 }).withMessage('Máximo 60 caracteres'),
  body('descripcion').optional().isLength({ max: 255 }).withMessage('Máximo 255 caracteres'),
  body('capacidad').isInt({ min: 1 }).withMessage('La capacidad debe ser un entero mayor o igual a 1'),
  body('precio_noche').isFloat({ gt: 0 }).withMessage('El precio debe ser mayor que 0'),
];

const listar = [
  query('pagina').optional().isInt({ min: 1 }).withMessage('pagina debe ser un entero positivo'),
  query('limite').optional().isInt({ min: 1, max: 100 }).withMessage('limite debe estar entre 1 y 100'),
  query('capacidad').optional().isInt({ min: 1 }).withMessage('capacidad debe ser un entero positivo'),
];

module.exports = { id, cuerpo, listar };