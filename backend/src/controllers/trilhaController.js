const Trilha = require('../models/Trilha');
const Curso = require('../models/Curso');
const Usuario = require('../models/Usuario');
const Vaga = require('../models/Vaga');

// POST /api/trilha
async function gerar(req, res) {
    try {
        const usuario = await Usuario.buscarPorId(req.usuarioId);
        if (!usuario.area_interesse) {
            return res.status(400).json({ erro: 'Faça o diagnóstico antes de gerar a trilha.' });
        }

        await Trilha.gerar(req.usuarioId);
        res.status(201).json({ mensagem: 'Trilha gerada!' });
    } catch (erro) {
        console.log('Erro ao gerar trilha:', erro.message);
        res.status(500).json({ erro: 'Não foi possível gerar a trilha.' });
    }
}

// GET /api/trilha
async function buscar(req, res) {
    try {
        const cursos = await Trilha.buscar(req.usuarioId);
        const concluidos = cursos.filter(c => c.concluido).length;
        const percentual = cursos.length > 0 ? Math.round((concluidos / cursos.length) * 100) : 0;

        const usuario = await Usuario.buscarPorId(req.usuarioId);
        const competencias = await Usuario.idsCompetencias(req.usuarioId);
        const vagas = await Vaga.listarComAderencia(competencias, { area: usuario.area_interesse });

        let aderenciaMedia = 0;
        if (vagas.length > 0) {
            let soma = 0;
            vagas.forEach(v => {
                soma += v.aderencia;
            });
            aderenciaMedia = Math.round(soma / vagas.length);
        }

        res.json({
            area: usuario.area_interesse,
            total: cursos.length,
            concluidos,
            percentual,
            aderenciaMedia,
            proximo: cursos.find(c => !c.concluido) || null,
            cursos
        });
    } catch (erro) {
        console.log('Erro ao buscar trilha:', erro.message);
        res.status(500).json({ erro: 'Não foi possível carregar a trilha.' });
    }
}

// PATCH /api/trilha/progresso/:id
async function atualizarProgresso(req, res) {
    const concluido = req.body.concluido === true;

    try {
        const ok = await Trilha.marcarConcluido(req.usuarioId, req.params.id, concluido);
        if (!ok) {
            return res.status(404).json({ erro: 'Curso não encontrado na sua trilha.' });
        }
        res.json({ mensagem: concluido ? 'Curso concluído!' : 'Curso desmarcado.' });
    } catch (erro) {
        console.log('Erro ao atualizar progresso:', erro.message);
        res.status(500).json({ erro: 'Não foi possível atualizar o progresso.' });
    }
}

// POST /api/trilha/cursos
async function adicionarCurso(req, res) {
    const { cursoId } = req.body;

    try {
        const curso = await Curso.buscarPorId(cursoId);
        if (!curso) {
            return res.status(404).json({ erro: 'Curso não encontrado.' });
        }

        const adicionou = await Trilha.adicionarCurso(req.usuarioId, cursoId);
        if (!adicionou) {
            return res.status(409).json({ erro: 'Esse curso já está na sua trilha.' });
        }
        res.status(201).json({ mensagem: 'Curso adicionado à trilha.' });
    } catch (erro) {
        console.log('Erro ao adicionar curso:', erro.message);
        res.status(500).json({ erro: 'Não foi possível adicionar o curso.' });
    }
}

// DELETE /api/trilha/cursos/:id
async function removerCurso(req, res) {
    try {
        const ok = await Trilha.removerCurso(req.usuarioId, req.params.id);
        if (!ok) {
            return res.status(404).json({ erro: 'Curso não encontrado na sua trilha.' });
        }
        res.json({ mensagem: 'Curso removido da trilha.' });
    } catch (erro) {
        console.log('Erro ao remover curso:', erro.message);
        res.status(500).json({ erro: 'Não foi possível remover o curso.' });
    }
}

module.exports = { gerar, buscar, atualizarProgresso, adicionarCurso, removerCurso };
