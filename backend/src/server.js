require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/db');

const usuarioRoutes = require('./routes/usuarioRoutes');
const cursoRoutes = require('./routes/cursoRoutes');
const trilhaRoutes = require('./routes/trilhaRoutes');
const vagaRoutes = require('./routes/vagaRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// rotas da API
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/cursos', cursoRoutes);
app.use('/api/trilha', trilhaRoutes);
app.use('/api/vagas', vagaRoutes);

// telas (pasta frontend)
app.use(express.static(path.join(__dirname, '..', '..', 'frontend')));

app.get('/', (req, res) => {
    res.redirect('/login.html');
});

// rota não encontrada
app.use('/api', (req, res) => {
    res.status(404).json({ erro: 'Rota não encontrada.' });
});

const PORTA = process.env.PORTA || 3000;

app.listen(PORTA, async () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);

    try {
        await db.query('SELECT 1');
        console.log('Conectado ao MySQL (' + process.env.DB_NOME + ')');
    } catch (erro) {
        console.log('Não foi possível conectar ao MySQL:', erro.message);
        console.log('Confira os dados do arquivo .env');
    }
});
