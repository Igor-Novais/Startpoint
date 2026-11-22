// Confere o tipo de conta (usar depois do verificarToken)

// só o administrador
function somenteAdmin(req, res, next) {
    if (req.perfil !== 'admin') {
        return res.status(403).json({ erro: 'Você não tem permissão para fazer isso.' });
    }
    next();
}

// empresa ou administrador
function empresaOuAdmin(req, res, next) {
    if (req.perfil !== 'empresa' && req.perfil !== 'admin') {
        return res.status(403).json({ erro: 'Você não tem permissão para fazer isso.' });
    }
    next();
}

module.exports = { somenteAdmin, empresaOuAdmin };
