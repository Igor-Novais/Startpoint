const express = require('express');
const router = express.Router();
const cursoController = require('../controllers/cursoController');
const verificarToken = require('../middlewares/auth');
const { somenteAdmin, empresaOuAdmin } = require('../middlewares/perfil');

// jovem
router.get('/', verificarToken, cursoController.listar);
router.get('/areas', verificarToken, cursoController.listarAreas);

// só administrador
router.get('/todos', verificarToken, somenteAdmin, cursoController.listarTodos);
router.get('/opcoes', verificarToken, somenteAdmin, cursoController.opcoes);
router.get('/:id', verificarToken, somenteAdmin, cursoController.buscar);
router.post('/', verificarToken, somenteAdmin, cursoController.salvar);
router.put('/:id', verificarToken, somenteAdmin, cursoController.salvar);
router.patch('/:id/status', verificarToken, somenteAdmin, cursoController.alterarStatus);

module.exports = router;
