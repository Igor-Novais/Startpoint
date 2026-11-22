const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const verificarToken = require('../middlewares/auth');
const { somenteAdmin, empresaOuAdmin } = require('../middlewares/perfil');

// públicas
router.post('/', usuarioController.cadastrar);
router.post('/login', usuarioController.login);

// precisam de login
router.get('/perfil', verificarToken, usuarioController.perfil);
router.put('/diagnostico', verificarToken, usuarioController.salvarDiagnostico);

// só administrador
router.get('/resumo', verificarToken, somenteAdmin, usuarioController.resumo);

module.exports = router;
