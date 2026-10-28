const Vaga = require('../models/Vaga');
const Usuario = require('../models/Usuario');

// GET /api/vagas
async function listar(req, res) {
    try {
        const competencias = await Usuario.idsCompetencias(req.usuarioId);

        const vagas = await Vaga.listarComAderencia(competencias, {
            area: req.query.area,
            cidade: req.query.cidade
        });

        // requisitos que faltam em cada vaga
        const faltando = await Vaga.requisitosFaltando(vagas.map(v => v.id), competencias);

        vagas.forEach(vaga => {
            vaga.falta = faltando.filter(f => f.vaga_id === vaga.id);
        });

        res.json(vagas);
    } catch (erro) {
        console.log('Erro ao listar vagas:', erro.message);
        res.status(500).json({ erro: 'Não foi possível carregar as vagas.' });
    }
}

// GET /api/vagas/cidades
async function listarCidades(req, res) {
    try {
        res.json(await Vaga.listarCidades());
    } catch (erro) {
        console.log('Erro ao listar cidades:', erro.message);
        res.status(500).json({ erro: 'Não foi possível carregar as cidades.' });
    }
}

module.exports = { listar, listarCidades };
