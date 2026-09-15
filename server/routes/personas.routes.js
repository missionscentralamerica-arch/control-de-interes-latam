const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getPersonas, exportPersonas, updateEstado, getEstadoHistorial } = require('../controllers/personas.controller');

const router = express.Router();

router.use(authenticateToken);
router.get('/', getPersonas);
router.get('/export', exportPersonas);
router.patch('/:id/estado', updateEstado);
router.get('/:id/historial', getEstadoHistorial);

module.exports = router;
