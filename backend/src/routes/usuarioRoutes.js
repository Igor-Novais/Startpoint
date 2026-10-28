const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const verificarToken = require('../middlewares/auth');

// públicas
router.post('/', usuarioController.cadastrar);
router.post('/login', usuarioController.login);

// precisam de login
router.get('/perfil', verificarToken, usuarioController.perfil);
router.put('/diagnostico', verificarToken, usuarioController.salvarDiagnostico);

module.exports = router;
