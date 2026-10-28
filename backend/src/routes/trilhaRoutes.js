const express = require('express');
const router = express.Router();
const trilhaController = require('../controllers/trilhaController');
const verificarToken = require('../middlewares/auth');

// todas as rotas da trilha precisam de login
router.use(verificarToken);

router.get('/', trilhaController.buscar);
router.post('/', trilhaController.gerar);
router.patch('/progresso/:id', trilhaController.atualizarProgresso);
router.post('/cursos', trilhaController.adicionarCurso);
router.delete('/cursos/:id', trilhaController.removerCurso);

module.exports = router;
