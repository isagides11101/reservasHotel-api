router.get('/', v.listar, validar, c.listar);
router.get('/:id', v.id, validar, c.obtener);
router.post('/', v.cuerpo, validar, c.crear);
router.put('/:id', v.id, v.cuerpo, validar, c.actualizar);
router.patch('/:id/estado', v.id, v.estado, validar, c.cambiarEstado);
router.delete('/:id', v.id, validar, c.eliminar);