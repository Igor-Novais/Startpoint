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

// Rotas da empresa e do administrador

// GET /api/vagas/opcoes
async function opcoes(req, res) {
    try {
        res.json(await Vaga.opcoes());
    } catch (erro) {
        console.log('Erro nas opções de vaga:', erro.message);
        res.status(500).json({ erro: 'Não foi possível carregar o formulário.' });
    }
}

// GET /api/vagas/gestao (empresa vê as suas, administrador vê todas)
async function listarGestao(req, res) {
    try {
        const dono = req.perfil === 'admin' ? null : req.usuarioId;
        res.json(await Vaga.listarGestao(dono));
    } catch (erro) {
        console.log('Erro ao listar vagas da gestão:', erro.message);
        res.status(500).json({ erro: 'Não foi possível carregar as vagas.' });
    }
}

// Busca a vaga e confere se a empresa é a dona (o administrador pode tudo)
async function buscarPermitida(req, res) {
    const vaga = await Vaga.buscarCompleta(req.params.id);

    if (!vaga) {
        res.status(404).json({ erro: 'Vaga não encontrada.' });
        return null;
    }
    if (req.perfil === 'empresa' && vaga.usuario_id !== req.usuarioId) {
        res.status(403).json({ erro: 'Esta vaga é de outra empresa.' });
        return null;
    }
    return vaga;
}

// GET /api/vagas/:id
async function buscar(req, res) {
    try {
        const vaga = await buscarPermitida(req, res);
        if (vaga) {
            res.json(vaga);
        }
    } catch (erro) {
        console.log('Erro ao buscar vaga:', erro.message);
        res.status(500).json({ erro: 'Não foi possível carregar a vaga.' });
    }
}

// Confere os campos do formulário e devolve a mensagem do primeiro erro (ou vazio)
function validarVaga(dados, requisitos, areas) {
    if (!dados.titulo || dados.titulo.length < 3) {
        return 'Informe o título da vaga.';
    }
    if (!dados.empresa || dados.empresa.length < 2) {
        return 'Informe o nome da empresa.';
    }
    if (!areas.includes(dados.area)) {
        return 'Escolha a área da vaga.';
    }
    if (!dados.descricao || dados.descricao.length < 10) {
        return 'Descreva a vaga (mínimo 10 caracteres).';
    }
    if (!dados.link_candidatura) {
        return 'Informe o site ou o e-mail para o jovem se candidatar.';
    }
    if (dados.bolsa !== null && (isNaN(dados.bolsa) || dados.bolsa < 0)) {
        return 'A bolsa precisa ser um valor em reais.';
    }
    if (isNaN(dados.quantidade) || dados.quantidade < 1) {
        return 'A quantidade de vagas precisa ser 1 ou mais.';
    }
    if (dados.data_limite && isNaN(Date.parse(dados.data_limite))) {
        return 'Data limite inválida.';
    }
    const obrigatorios = requisitos.filter(r => r.tipo_requisito === 'obrigatoria');
    if (obrigatorios.length === 0) {
        return 'Marque pelo menos um requisito obrigatório.';
    }
    return '';
}

// Tira os espaços do começo e do fim (ou devolve vazio)
function limpar(valor) {
    if (!valor) {
        return '';
    }
    return valor.toString().trim();
}

// Monta os dados da vaga a partir do corpo da requisição
function lerFormulario(body) {
    const dados = {
        titulo: limpar(body.titulo),
        empresa: limpar(body.empresa),
        area: limpar(body.area),
        descricao: limpar(body.descricao),
        cidade: limpar(body.cidade) || 'São Paulo/SP',
        bolsa: null,
        modalidade: limpar(body.modalidade) || 'Presencial',
        quantidade: Number(body.quantidade || 1),
        beneficios: limpar(body.beneficios) || null,
        data_limite: limpar(body.data_limite) || null,
        link_candidatura: limpar(body.link_candidatura)
    };

    // a bolsa é opcional
    if (body.bolsa !== undefined && body.bolsa !== null && body.bolsa !== '') {
        dados.bolsa = Number(body.bolsa);
    }

    // requisitos: [{ competencia_id, tipo_requisito }] sem repetir competência
    const requisitos = [];
    const usados = [];
    if (Array.isArray(body.requisitos)) {
        body.requisitos.forEach(r => {
            const id = Number(r.competencia_id);
            if (id > 0 && !usados.includes(id)) {
                usados.push(id);
                requisitos.push({
                    competencia_id: id,
                    tipo_requisito: r.tipo_requisito === 'desejavel' ? 'desejavel' : 'obrigatoria'
                });
            }
        });
    }

    return { dados, requisitos };
}

// POST /api/vagas e PUT /api/vagas/:id
async function salvar(req, res) {
    try {
        let vagaAtual = null;
        if (req.params.id) {
            vagaAtual = await buscarPermitida(req, res);
            if (!vagaAtual) {
                return;
            }
        }

        const { dados, requisitos } = lerFormulario(req.body);

        // a empresa sempre anuncia com o próprio nome
        if (req.perfil === 'empresa') {
            const conta = await Usuario.buscarPorId(req.usuarioId);
            dados.empresa = conta.nome_completo;
        }

        const { areas } = await Vaga.opcoes();
        const erro = validarVaga(dados, requisitos, areas);
        if (erro) {
            return res.status(400).json({ erro });
        }

        // vaga de empresa passa pelo administrador (nova ou alterada)
        if (req.perfil === 'empresa') {
            dados.status = 'pendente';
        } else {
            dados.status = vagaAtual ? vagaAtual.status : 'ativo';
        }
        dados.usuario_id = req.perfil === 'empresa' ? req.usuarioId : null;

        const id = await Vaga.salvar(dados, requisitos, vagaAtual ? vagaAtual.id : null);

        const mensagem = dados.status === 'pendente'
            ? 'Vaga enviada! Ela aparece para os jovens depois da aprovação do administrador.'
            : 'Vaga salva e publicada.';
        res.status(vagaAtual ? 200 : 201).json({ mensagem, id, status: dados.status });
    } catch (erro) {
        console.log('Erro ao salvar vaga:', erro.message);
        res.status(500).json({ erro: 'Não foi possível salvar a vaga.' });
    }
}

// PATCH /api/vagas/:id/status
async function alterarStatus(req, res) {
    const { status } = req.body;

    // empresa só pode encerrar a própria vaga
    const permitidos = req.perfil === 'admin' ? ['ativo', 'inativo', 'recusada'] : ['inativo'];
    if (!permitidos.includes(status)) {
        return res.status(400).json({ erro: 'Situação inválida.' });
    }

    try {
        const vaga = await buscarPermitida(req, res);
        if (!vaga) {
            return;
        }

        await Vaga.alterarStatus(vaga.id, status);
        res.json({ mensagem: 'Situação da vaga atualizada.', status });
    } catch (erro) {
        console.log('Erro ao alterar a vaga:', erro.message);
        res.status(500).json({ erro: 'Não foi possível alterar a vaga.' });
    }
}

module.exports = { listar, listarCidades, opcoes, listarGestao, buscar, salvar, alterarStatus };
