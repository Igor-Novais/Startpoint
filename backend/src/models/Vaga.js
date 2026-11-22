const db = require('../config/db');

class Vaga {

    // Vagas ativas com a aderência (requisitos atendidos / total)
    static async listarComAderencia(competenciasUsuario, filtros) {
        // IN () vazio dá erro, então usa 0
        const tem = competenciasUsuario.length > 0 ? competenciasUsuario : [0];

        let sql = `
            SELECT v.id, v.titulo, v.empresa, v.area, v.descricao, v.cidade, v.bolsa, v.modalidade,
                   v.quantidade, v.beneficios, v.data_limite, v.link_candidatura,
                   COUNT(vc.competencia_id) AS total_requisitos,
                   SUM(CASE WHEN vc.competencia_id IN (?) THEN 1 ELSE 0 END) AS requisitos_atendidos
            FROM vaga v
            INNER JOIN vaga_competencia vc ON vc.vaga_id = v.id
            WHERE v.status = 'ativo'
              AND (v.data_limite IS NULL OR v.data_limite >= CURDATE())`;
        const parametros = [tem];

        if (filtros.area) {
            sql += ' AND v.area = ?';
            parametros.push(filtros.area);
        }

        if (filtros.cidade) {
            sql += ' AND v.cidade = ?';
            parametros.push(filtros.cidade);
        }

        sql += ' GROUP BY v.id';
        sql += ' ORDER BY requisitos_atendidos / total_requisitos DESC, v.bolsa DESC';

        const [linhas] = await db.query(sql, parametros);

        return linhas.map(vaga => {
            vaga.aderencia = Math.round((vaga.requisitos_atendidos / vaga.total_requisitos) * 100);
            return vaga;
        });
    }

    // Requisitos que o usuário ainda não tem, com um curso que ensina cada um
    // (de preferência da mesma área da vaga e o mais curto)
    static async requisitosFaltando(vagaIds, competenciasUsuario) {
        if (vagaIds.length === 0) {
            return [];
        }
        const tem = competenciasUsuario.length > 0 ? competenciasUsuario : [0];

        const [linhas] = await db.query(
            `SELECT vc.vaga_id, c.nome, vc.tipo_requisito,
                    (SELECT cu.nome FROM curso_competencia cc
                     INNER JOIN curso cu ON cu.id = cc.curso_id
                     WHERE cc.competencia_id = c.id AND cu.status = 'ativo'
                     ORDER BY CASE WHEN cu.area = v.area THEN 0 ELSE 1 END, cu.duracao
                     LIMIT 1) AS curso
             FROM vaga_competencia vc
             INNER JOIN vaga v ON v.id = vc.vaga_id
             INNER JOIN competencia c ON c.id = vc.competencia_id
             WHERE vc.vaga_id IN (?) AND vc.competencia_id NOT IN (?)
             ORDER BY vc.tipo_requisito, c.nome`,
            [vagaIds, tem]
        );
        return linhas;
    }

    static async listarCidades() {
        const [linhas] = await db.query("SELECT DISTINCT cidade FROM vaga WHERE status = 'ativo' ORDER BY cidade");
        return linhas.map(l => l.cidade);
    }

    // Usados pela empresa e pelo administrador

    // Áreas e competências para montar o formulário de vaga
    static async opcoes() {
        const [areas] = await db.query("SELECT DISTINCT area FROM competencia WHERE area <> 'Geral' ORDER BY area");
        const [competencias] = await db.query('SELECT id, nome, area FROM competencia ORDER BY area, nome');
        return { areas: areas.map(a => a.area), competencias };
    }

    // Vagas de uma empresa (ou todas, quando usuarioId é null = administrador)
    static async listarGestao(usuarioId) {
        let sql = `
            SELECT v.id, v.titulo, v.empresa, v.area, v.descricao, v.cidade, v.bolsa, v.modalidade,
                   v.quantidade, v.beneficios, v.data_limite, v.link_candidatura, v.data_verificacao, v.status,
                   COUNT(vc.competencia_id) AS requisitos,
                   GROUP_CONCAT(CASE WHEN vc.tipo_requisito = 'desejavel' THEN CONCAT(c.nome, ' (desejável)')
                                     ELSE c.nome END
                                ORDER BY vc.tipo_requisito, c.nome SEPARATOR ', ') AS lista_requisitos
            FROM vaga v
            LEFT JOIN vaga_competencia vc ON vc.vaga_id = v.id
            LEFT JOIN competencia c ON c.id = vc.competencia_id`;
        const parametros = [];

        if (usuarioId !== null) {
            sql += ' WHERE v.usuario_id = ?';
            parametros.push(usuarioId);
        }

        // pendentes primeiro, depois as mais recentes
        sql += ` GROUP BY v.id
                 ORDER BY CASE WHEN v.status = 'pendente' THEN 0 ELSE 1 END, v.id DESC`;

        const [linhas] = await db.query(sql, parametros);
        return linhas;
    }

    // Vaga com os requisitos (para editar)
    static async buscarCompleta(id) {
        const [linhas] = await db.query('SELECT * FROM vaga WHERE id = ?', [id]);
        if (linhas.length === 0) {
            return null;
        }
        const vaga = linhas[0];

        const [requisitos] = await db.query(
            'SELECT competencia_id, tipo_requisito FROM vaga_competencia WHERE vaga_id = ?',
            [id]
        );
        vaga.requisitos = requisitos;
        return vaga;
    }

    // Cria (id = null) ou altera a vaga e os requisitos numa transação
    static async salvar(dados, requisitos, id) {
        const conexao = await db.getConnection();

        try {
            await conexao.beginTransaction();

            const valores = [dados.titulo, dados.empresa, dados.area, dados.descricao, dados.cidade,
                dados.bolsa, dados.modalidade, dados.quantidade, dados.beneficios, dados.data_limite,
                dados.link_candidatura, dados.status];

            if (id) {
                await conexao.query(
                    `UPDATE vaga SET titulo = ?, empresa = ?, area = ?, descricao = ?, cidade = ?, bolsa = ?,
                     modalidade = ?, quantidade = ?, beneficios = ?, data_limite = ?, link_candidatura = ?,
                     status = ?, data_verificacao = CURDATE()
                     WHERE id = ?`,
                    valores.concat([id])
                );
                await conexao.query('DELETE FROM vaga_competencia WHERE vaga_id = ?', [id]);
            } else {
                const [resultado] = await conexao.query(
                    `INSERT INTO vaga (titulo, empresa, area, descricao, cidade, bolsa, modalidade, quantidade,
                     beneficios, data_limite, link_candidatura, status, usuario_id, data_verificacao)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`,
                    valores.concat([dados.usuario_id])
                );
                id = resultado.insertId;
            }

            for (const requisito of requisitos) {
                await conexao.query(
                    'INSERT INTO vaga_competencia (vaga_id, competencia_id, tipo_requisito) VALUES (?, ?, ?)',
                    [id, requisito.competencia_id, requisito.tipo_requisito]
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

    // Aprovar, recusar, encerrar ou reativar
    static async alterarStatus(id, status) {
        await db.query(
            'UPDATE vaga SET status = ?, data_verificacao = CURDATE() WHERE id = ?',
            [status, id]
        );
    }
}

module.exports = Vaga;
