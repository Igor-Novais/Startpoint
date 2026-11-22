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

    // Usados pelo administrador

    // Todos os cursos, ativos e inativos, com o que cada um ensina
    static async listarTodos() {
        const [linhas] = await db.query(
            `SELECT c.id, c.nome, c.area, c.modalidade, c.duracao, c.periodo_de_inscricao,
                    c.status, c.data_verificacao, i.nome AS instituicao,
                    GROUP_CONCAT(co.nome ORDER BY co.nome SEPARATOR ', ') AS competencias
             FROM curso c
             INNER JOIN instituicao i ON i.id = c.instituicao_id
             LEFT JOIN curso_competencia cc ON cc.curso_id = c.id
             LEFT JOIN competencia co ON co.id = cc.competencia_id
             GROUP BY c.id
             ORDER BY c.status, c.area, c.nome`
        );
        return linhas;
    }

    // Instituições, áreas e competências para o formulário de curso
    static async opcoes() {
        const [instituicoes] = await db.query('SELECT id, nome FROM instituicao ORDER BY nome');
        const [areas] = await db.query("SELECT DISTINCT area FROM competencia WHERE area <> 'Geral' ORDER BY area");
        const [competencias] = await db.query('SELECT id, nome, area FROM competencia ORDER BY area, nome');
        return { instituicoes, areas: areas.map(a => a.area), competencias };
    }

    // Curso com as competências (para editar)
    static async buscarCompleto(id) {
        const [linhas] = await db.query('SELECT * FROM curso WHERE id = ?', [id]);
        if (linhas.length === 0) {
            return null;
        }
        const curso = linhas[0];

        const [competencias] = await db.query(
            'SELECT competencia_id FROM curso_competencia WHERE curso_id = ?',
            [id]
        );
        curso.competencias = competencias.map(c => c.competencia_id);
        return curso;
    }

    // Cria (id = null) ou altera o curso e o que ele ensina numa transação
    static async salvar(dados, competencias, id) {
        const conexao = await db.getConnection();

        try {
            await conexao.beginTransaction();

            const valores = [dados.instituicao_id, dados.nome, dados.area, dados.modalidade, dados.duracao,
                dados.periodo_de_inscricao, dados.link_oficial];

            if (id) {
                await conexao.query(
                    `UPDATE curso SET instituicao_id = ?, nome = ?, area = ?, modalidade = ?, duracao = ?,
                     periodo_de_inscricao = ?, link_oficial = ?, data_verificacao = CURDATE()
                     WHERE id = ?`,
                    valores.concat([id])
                );
                await conexao.query('DELETE FROM curso_competencia WHERE curso_id = ?', [id]);
            } else {
                const [resultado] = await conexao.query(
                    `INSERT INTO curso (instituicao_id, nome, area, modalidade, duracao, periodo_de_inscricao,
                     link_oficial, data_verificacao, status)
                     VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), 'ativo')`,
                    valores
                );
                id = resultado.insertId;
            }

            for (const competenciaId of competencias) {
                await conexao.query(
                    'INSERT INTO curso_competencia (curso_id, competencia_id) VALUES (?, ?)',
                    [id, competenciaId]
                );
            }

            await conexao.commit();
            return id;
        } catch (erro) {
            await conexao.rollback();
            throw erro;
        } finally {
            conexao.release();
        }
    }

    static async alterarStatus(id, status) {
        await db.query(
            'UPDATE curso SET status = ?, data_verificacao = CURDATE() WHERE id = ?',
            [status, id]
        );
    }
}

module.exports = Curso;
