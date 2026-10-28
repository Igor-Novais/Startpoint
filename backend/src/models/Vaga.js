const db = require('../config/db');

class Vaga {

    // Vagas ativas com a aderência (requisitos atendidos / total)
    static async listarComAderencia(competenciasUsuario, filtros) {
        // IN () vazio dá erro, então usa 0
        const tem = competenciasUsuario.length > 0 ? competenciasUsuario : [0];

        let sql = `
            SELECT v.id, v.titulo, v.empresa, v.area, v.cidade, v.bolsa, v.modalidade,
                   v.link_candidatura,
                   COUNT(vc.competencia_id) AS total_requisitos,
                   SUM(vc.competencia_id IN (?)) AS requisitos_atendidos
            FROM vaga v
            INNER JOIN vaga_competencia vc ON vc.vaga_id = v.id
            WHERE v.status = 'ativo'`;
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
                     ORDER BY cu.area = v.area DESC, cu.duracao
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
}

module.exports = Vaga;
