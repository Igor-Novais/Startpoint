const Curso = require('../models/Curso');

// GET /api/cursos
async function listar(req, res) {
    try {
        const cursos = await Curso.listar(req.usuarioId);
        res.json(cursos);
    } catch (erro) {
        console.log('Erro ao listar cursos:', erro.message);
        res.status(500).json({ erro: 'Não foi possível carregar os cursos.' });
    }
}

// GET /api/cursos/areas
async function listarAreas(req, res) {
    try {
        res.json(await Curso.listarAreas());
    } catch (erro) {
        console.log('Erro ao listar áreas:', erro.message);
        res.status(500).json({ erro: 'Não foi possível carregar as áreas.' });
    }
}

module.exports = { listar, listarAreas };
