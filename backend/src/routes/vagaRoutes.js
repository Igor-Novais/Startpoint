const express = require('express');
const router = express.Router();
const vagaController = require('../controllers/vagaController');
const verificarToken = require('../middlewares/auth');
const { somenteAdmin, empresaOuAdmin } = require('../middlewares/perfil');

// jovem
router.get('/', verificarToken, vagaController.listar);
router.get('/cidades', verificarToken, vagaController.listarCidades);

// empresa e administrador
router.get('/opcoes', verificarToken, empresaOuAdmin, vagaController.opcoes);
router.get('/gestao', verificarToken, empresaOuAdmin, vagaController.listarGestao);
router.get('/:id', verificarToken, empresaOuAdmin, vagaController.buscar);
router.post('/', verificarToken, empresaOuAdmin, vagaController.salvar);
router.put('/:id', verificarToken, empresaOuAdmin, vagaController.salvar);
router.patch('/:id/status', verificarToken, empresaOuAdmin, vagaController.alterarStatus);

module.exports = router;
