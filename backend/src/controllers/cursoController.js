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

// Rotas do administrador

// GET /api/cursos/todos
async function listarTodos(req, res) {
    try {
        res.json(await Curso.listarTodos());
    } catch (erro) {
        console.log('Erro ao listar todos os cursos:', erro.message);
        res.status(500).json({ erro: 'Não foi possível carregar os cursos.' });
    }
}

// GET /api/cursos/opcoes
async function opcoes(req, res) {
    try {
        res.json(await Curso.opcoes());
    } catch (erro) {
        console.log('Erro nas opções de curso:', erro.message);
        res.status(500).json({ erro: 'Não foi possível carregar o formulário.' });
    }
}

// GET /api/cursos/:id
async function buscar(req, res) {
    try {
        const curso = await Curso.buscarCompleto(req.params.id);
        if (!curso) {
            return res.status(404).json({ erro: 'Curso não encontrado.' });
        }
        res.json(curso);
    } catch (erro) {
        console.log('Erro ao buscar curso:', erro.message);
        res.status(500).json({ erro: 'Não foi possível carregar o curso.' });
    }
}

// Confere os campos do curso e devolve a mensagem do primeiro erro (ou vazio)
function validarCurso(dados, competencias, idsInstituicoes, areas) {
    if (!dados.nome || dados.nome.length < 3) {
        return 'Informe o nome do curso.';
    }
    if (!idsInstituicoes.includes(dados.instituicao_id)) {
        return 'Escolha a instituição.';
    }
    if (!areas.includes(dados.area)) {
        return 'Escolha a área do curso.';
    }
    if (isNaN(dados.duracao) || dados.duracao < 1) {
        return 'Informe a duração em horas.';
    }
    if (!dados.link_oficial || !dados.link_oficial.startsWith('http')) {
        return 'Informe o link oficial (começando com http).';
    }
    if (competencias.length === 0) {
        return 'Marque pelo menos uma competência que o curso ensina.';
    }
    return '';
}

// POST /api/cursos e PUT /api/cursos/:id
async function salvar(req, res) {
    const { nome, area, modalidade, periodo_de_inscricao, link_oficial } = req.body;

    const dados = {
        instituicao_id: Number(req.body.instituicao_id),
        nome: nome ? nome.trim() : '',
        area: area,
        modalidade: modalidade || 'Online',
        duracao: Number(req.body.duracao),
        periodo_de_inscricao: periodo_de_inscricao || 'Inscrições abertas',
        link_oficial: link_oficial ? link_oficial.trim() : ''
    };

    // competências marcadas, sem repetir
    const competencias = [];
    if (Array.isArray(req.body.competencias)) {
        req.body.competencias.forEach(valor => {
            const id = Number(valor);
            if (id > 0 && !competencias.includes(id)) {
                competencias.push(id);
            }
        });
    }

    try {
        const opcoes = await Curso.opcoes();
        const idsInstituicoes = opcoes.instituicoes.map(i => i.id);

        const erro = validarCurso(dados, competencias, idsInstituicoes, opcoes.areas);
        if (erro) {
            return res.status(400).json({ erro });
        }

        let id = null;
        if (req.params.id) {
            const atual = await Curso.buscarCompleto(req.params.id);
            if (!atual) {
                return res.status(404).json({ erro: 'Curso não encontrado.' });
            }
            id = atual.id;
        }

        const novoId = await Curso.salvar(dados, competencias, id);
        res.status(id ? 200 : 201).json({ mensagem: 'Curso salvo.', id: novoId });
    } catch (erro) {
        console.log('Erro ao salvar curso:', erro.message);
        res.status(500).json({ erro: 'Não foi possível salvar o curso.' });
    }
}

// PATCH /api/cursos/:id/status
async function alterarStatus(req, res) {
    const { status } = req.body;
    if (!['ativo', 'inativo'].includes(status)) {
        return res.status(400).json({ erro: 'Situação inválida.' });
    }

    try {
        const curso = await Curso.buscarCompleto(req.params.id);
        if (!curso) {
            return res.status(404).json({ erro: 'Curso não encontrado.' });
        }
        await Curso.alterarStatus(curso.id, status);
        res.json({ mensagem: 'Situação do curso atualizada.', status });
    } catch (erro) {
        console.log('Erro ao alterar curso:', erro.message);
        res.status(500).json({ erro: 'Não foi possível alterar o curso.' });
    }
}

module.exports = { listar, listarAreas, listarTodos, opcoes, buscar, salvar, alterarStatus };
