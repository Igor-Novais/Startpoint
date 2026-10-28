const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const Trilha = require('../models/Trilha');

// POST /api/usuarios
async function cadastrar(req, res) {
    const { nome, email, senha } = req.body;

    if (!nome || nome.trim().length < 3) {
        return res.status(400).json({ erro: 'Informe seu nome (mínimo 3 letras).' });
    }
    if (!email || !email.includes('@')) {
        return res.status(400).json({ erro: 'Informe um e-mail válido.' });
    }
    if (!senha || senha.length < 6) {
        return res.status(400).json({ erro: 'A senha precisa ter pelo menos 6 caracteres.' });
    }

    try {
        const existe = await Usuario.buscarPorEmail(email);
        if (existe) {
            return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
        }

        // salva só o hash da senha
        const senhaHash = await bcrypt.hash(senha, 10);
        const id = await Usuario.criar(nome.trim(), email.trim().toLowerCase(), senhaHash);

        res.status(201).json({ mensagem: 'Conta criada com sucesso!', id });
    } catch (erro) {
        console.log('Erro no cadastro:', erro.message);
        res.status(500).json({ erro: 'Não foi possível criar a conta agora.' });
    }
}

// POST /api/usuarios/login
async function login(req, res) {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: 'Preencha e-mail e senha.' });
    }

    try {
        const usuario = await Usuario.buscarPorEmail(email.trim().toLowerCase());

        if (!usuario || !(await bcrypt.compare(senha, usuario.senha_hash))) {
            return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
        }

        const token = jwt.sign(
            { id: usuario.id, nome: usuario.nome_completo },
            process.env.JWT_SEGREDO,
            { expiresIn: '8h' }
        );

        res.json({
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome_completo,
                email: usuario.email,
                diagnosticoFeito: usuario.area_interesse !== null
            }
        });
    } catch (erro) {
        console.log('Erro no login:', erro.message);
        res.status(500).json({ erro: 'Não foi possível entrar agora.' });
    }
}

// GET /api/usuarios/perfil
async function perfil(req, res) {
    try {
        const usuario = await Usuario.buscarPorId(req.usuarioId);
        if (!usuario) {
            return res.status(404).json({ erro: 'Usuário não encontrado.' });
        }

        const competencias = await Usuario.competenciasInformadas(req.usuarioId);
        const trilha = await Trilha.buscar(req.usuarioId);
        const concluidos = trilha.filter(c => c.concluido).length;

        usuario.competencias = competencias;
        usuario.cursos_concluidos = concluidos;
        res.json(usuario);
    } catch (erro) {
        console.log('Erro no perfil:', erro.message);
        res.status(500).json({ erro: 'Não foi possível carregar o perfil.' });
    }
}

// PUT /api/usuarios/diagnostico
async function salvarDiagnostico(req, res) {
    const { escolaridade, regiao, area, competencias } = req.body;

    if (!escolaridade || !regiao || !area) {
        return res.status(400).json({ erro: 'Responda todas as etapas do diagnóstico.' });
    }

    try {
        const lista = Array.isArray(competencias) ? competencias : [];
        await Usuario.salvarDiagnostico(req.usuarioId, escolaridade, regiao, area, lista);
        res.json({ mensagem: 'Diagnóstico salvo.' });
    } catch (erro) {
        console.log('Erro no diagnóstico:', erro.message);
        res.status(500).json({ erro: 'Não foi possível salvar o diagnóstico.' });
    }
}

module.exports = { cadastrar, login, perfil, salvarDiagnostico };
