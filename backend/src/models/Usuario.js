const db = require('../config/db');

class Usuario {

    static async criar(nome, email, senhaHash) {
        const [resultado] = await db.query(
            'INSERT INTO usuario (nome_completo, email, senha_hash) VALUES (?, ?, ?)',
            [nome, email, senhaHash]
        );
        return resultado.insertId;
    }

    static async buscarPorEmail(email) {
        const [linhas] = await db.query('SELECT * FROM usuario WHERE email = ?', [email]);
        return linhas[0];
    }

    static async buscarPorId(id) {
        const [linhas] = await db.query(
            `SELECT id, nome_completo, email, escolaridade, regiao, area_interesse, data_cadastro
             FROM usuario WHERE id = ?`,
            [id]
        );
        return linhas[0];
    }

    // Salva o diagnóstico (a etapa 2 vai na usuario_competencia)
    static async salvarDiagnostico(id, escolaridade, regiao, area, competencias) {
        await db.query(
            'UPDATE usuario SET escolaridade = ?, regiao = ?, area_interesse = ? WHERE id = ?',
            [escolaridade, regiao, area, id]
        );

        // apaga as respostas antigas antes de gravar
        await db.query('DELETE FROM usuario_competencia WHERE usuario_id = ?', [id]);

        if (competencias.length > 0) {
            await db.query(
                `INSERT INTO usuario_competencia (usuario_id, competencia_id)
                 SELECT ?, id FROM competencia WHERE nome IN (?)`,
                [id, competencias]
            );
        }
    }

    // Competências marcadas na etapa 2
    static async competenciasInformadas(id) {
        const [linhas] = await db.query(
            `SELECT c.nome FROM usuario_competencia uc
             INNER JOIN competencia c ON c.id = uc.competencia_id
             WHERE uc.usuario_id = ?`,
            [id]
        );
        return linhas.map(l => l.nome);
    }

    // Competências do usuário (diagnóstico + cursos concluídos)
    static async idsCompetencias(id) {
        const [linhas] = await db.query(
            `SELECT competencia_id FROM usuario_competencia WHERE usuario_id = ?
             UNION
             SELECT cc.competencia_id FROM progresso p
             INNER JOIN trilha t ON t.id = p.trilha_id
             INNER JOIN curso_competencia cc ON cc.curso_id = p.curso_id
             WHERE t.usuario_id = ? AND p.concluido = TRUE`,
            [id, id]
        );
        return linhas.map(l => l.competencia_id);
    }
}

module.exports = Usuario;
