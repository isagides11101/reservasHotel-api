const router = require('express').Router();
const v = require('../validaciones/reservaciones.validaciones');
const validar = require('../middlewares/validar');
const c = require('../controladores/reservaciones.controlador');

router.get('/', v.listar, validar, c.listar);
router.get('/:id', v.id, validar, c.obtener);
router.post('/', v.cuerpo, validar, c.crear);
router.patch('/:id/cancelar', v.id, validar, c.cancelar);
router.patch('/:id/finalizar', v.id, validar, c.finalizar);