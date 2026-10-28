// Verifica o token JWT (Authorization: Bearer <token>)
const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
    const cabecalho = req.headers.authorization;

    if (!cabecalho || !cabecalho.startsWith('Bearer ')) {
        return res.status(401).json({ erro: 'Faça login para continuar.' });
    }

    const token = cabecalho.split(' ')[1];

    try {
        const dados = jwt.verify(token, process.env.JWT_SEGREDO);
        req.usuarioId = dados.id;
        next();
    } catch (erro) {
        return res.status(401).json({ erro: 'Sessão expirada. Entre novamente.' });
    }
}

module.exports = verificarToken;
