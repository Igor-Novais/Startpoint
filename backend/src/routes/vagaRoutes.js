const express = require('express');
const router = express.Router();
const vagaController = require('../controllers/vagaController');
const verificarToken = require('../middlewares/auth');

router.get('/', verificarToken, vagaController.listar);
router.get('/cidades', verificarToken, vagaController.listarCidades);

module.exports = router;
