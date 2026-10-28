const express = require('express');
const router = express.Router();
const cursoController = require('../controllers/cursoController');
const verificarToken = require('../middlewares/auth');

router.get('/', verificarToken, cursoController.listar);
router.get('/areas', verificarToken, cursoController.listarAreas);

module.exports = router;
