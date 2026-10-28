const db = require('../config/db');

class Curso {

    // Cursos ativos (na_trilha = 1 se o curso já está na trilha do usuário)
    static async listar(usuarioId) {
        const [linhas] = await db.query(
            `SELECT c.id, c.nome, c.area, c.modalidade, c.duracao, c.periodo_de_inscricao,
                    c.link_oficial, i.nome AS instituicao,
                    EXISTS (SELECT 1 FROM progresso p
                            INNER JOIN trilha t ON t.id = p.trilha_id
                            WHERE p.curso_id = c.id AND t.usuario_id = ?) AS na_trilha
             FROM curso c
             INNER JOIN instituicao i ON i.id = c.instituicao_id
             WHERE c.status = 'ativo'
             ORDER BY c.area, c.nome`,
            [usuarioId]
        );
        return linhas;
    }

    static async buscarPorId(id) {
        const [linhas] = await db.query("SELECT * FROM curso WHERE id = ? AND status = 'ativo'", [id]);
        return linhas[0];
    }

    // Áreas (filtro da tela Vagas)
    static async listarAreas() {
        const [linhas] = await db.query("SELECT DISTINCT area FROM curso WHERE status = 'ativo' ORDER BY area");
        return linhas.map(l => l.area);
    }
}

module.exports = Curso;
