const db = require('../config/db');

class Trilha {

    // Gera a trilha: cursos que ensinam o que as vagas da área pedem
    // e o usuário ainda não sabe
    static async gerar(usuarioId) {
        const conexao = await db.getConnection();

        try {
            await conexao.beginTransaction();

            const [usuarios] = await conexao.query('SELECT area_interesse FROM usuario WHERE id = ?', [usuarioId]);
            const area = usuarios[0].area_interesse;

            // [1] trilha do usuário (cria se não tiver)
            let trilhaId;
            const [trilhas] = await conexao.query('SELECT id FROM trilha WHERE usuario_id = ?', [usuarioId]);

            if (trilhas.length > 0) {
                trilhaId = trilhas[0].id;
                await conexao.query('UPDATE trilha SET data_geracao = NOW() WHERE id = ?', [trilhaId]);
            } else {
                const [nova] = await conexao.query('INSERT INTO trilha (usuario_id) VALUES (?)', [usuarioId]);
                trilhaId = nova.insertId;
            }

            // [2] mantém só os cursos concluídos
            await conexao.query('DELETE FROM progresso WHERE trilha_id = ? AND concluido = FALSE', [trilhaId]);

            // [3] competências pedidas nas vagas da área que o usuário ainda não tem
            const [faltam] = await conexao.query(
                `SELECT DISTINCT vc.competencia_id
                 FROM vaga_competencia vc
                 INNER JOIN vaga v ON v.id = vc.vaga_id
                 WHERE v.area = ? AND v.status = 'ativo'
                   AND vc.competencia_id NOT IN (SELECT competencia_id FROM usuario_competencia WHERE usuario_id = ?)
                   AND vc.competencia_id NOT IN (SELECT cc.competencia_id FROM progresso p
                                                 INNER JOIN curso_competencia cc ON cc.curso_id = p.curso_id
                                                 WHERE p.trilha_id = ? AND p.concluido = TRUE)`,
                [area, usuarioId, trilhaId]
            );
            const idsFaltam = faltam.map(f => f.competencia_id);

            // [4] cursos que ensinam o que falta: primeiro os da área,
            // depois os que ensinam mais coisas e os mais curtos
            let cursos = [];
            if (idsFaltam.length > 0) {
                const [linhas] = await conexao.query(
                    `SELECT c.id
                     FROM curso c
                     INNER JOIN curso_competencia cc ON cc.curso_id = c.id
                     WHERE c.status = 'ativo'
                       AND cc.competencia_id IN (?)
                       AND c.id NOT IN (SELECT curso_id FROM progresso WHERE trilha_id = ?)
                     GROUP BY c.id, c.area, c.duracao
                     ORDER BY CASE WHEN c.area = ? THEN 0 ELSE 1 END, COUNT(*) DESC, c.duracao`,
                    [idsFaltam, trilhaId, area]
                );
                cursos = linhas;
            }

            // [5] pega os cursos na ordem, pulando os que não ensinam nada novo
            const escolhidos = [];
            const cobertas = [];

            for (const curso of cursos) {
                const [ensina] = await conexao.query(
                    'SELECT competencia_id FROM curso_competencia WHERE curso_id = ? AND competencia_id IN (?)',
                    [curso.id, idsFaltam]
                );
                const novas = ensina.filter(e => !cobertas.includes(e.competencia_id));

                if (novas.length > 0) {
                    escolhidos.push(curso.id);
                    novas.forEach(e => cobertas.push(e.competencia_id));
                }
            }

            // [6] se a área ainda não tem vagas, usa os cursos da área
            const [vagasDaArea] = await conexao.query(
                "SELECT COUNT(*) AS total FROM vaga WHERE area = ? AND status = 'ativo'",
                [area]
            );

            if (vagasDaArea[0].total === 0) {
                const [daArea] = await conexao.query(
                    `SELECT id FROM curso
                     WHERE area = ? AND status = 'ativo'
                       AND id NOT IN (SELECT curso_id FROM progresso WHERE trilha_id = ?)
                     ORDER BY duracao LIMIT 5`,
                    [area, trilhaId]
                );
                daArea.forEach(c => escolhidos.push(c.id));
            }

            // [7] grava na ordem sugerida
            const [ultima] = await conexao.query(
                'SELECT IFNULL(MAX(ordem_sugerida), 0) AS ordem FROM progresso WHERE trilha_id = ?',
                [trilhaId]
            );
            let ordem = ultima[0].ordem;

            for (const cursoId of escolhidos) {
                ordem++;
                await conexao.query(
                    'INSERT INTO progresso (trilha_id, curso_id, ordem_sugerida) VALUES (?, ?, ?)',
                    [trilhaId, cursoId, ordem]
                );
            }

            await conexao.commit();
            return trilhaId;
        } catch (erro) {
            await conexao.rollback();
            throw erro;
        } finally {
            conexao.release();
        }
    }

    // Cursos da trilha do usuário, na ordem sugerida
    static async buscar(usuarioId) {
        const [linhas] = await db.query(
            `SELECT p.id AS progresso_id, p.ordem_sugerida, p.concluido,
                    c.id AS curso_id, c.nome, c.area, c.modalidade, c.duracao,
                    c.periodo_de_inscricao, c.link_oficial, c.status, i.nome AS instituicao
             FROM trilha t
             INNER JOIN progresso p ON p.trilha_id = t.id
             INNER JOIN curso c ON c.id = p.curso_id
             INNER JOIN instituicao i ON i.id = c.instituicao_id
             WHERE t.usuario_id = ?
             ORDER BY p.ordem_sugerida`,
            [usuarioId]
        );
        return linhas;
    }

    // Confere se o curso da trilha (progresso) é desse usuário
    static async ehDoUsuario(usuarioId, progressoId) {
        const [linhas] = await db.query(
            `SELECT p.id FROM progresso p
             INNER JOIN trilha t ON t.id = p.trilha_id
             WHERE p.id = ? AND t.usuario_id = ?`,
            [progressoId, usuarioId]
        );
        return linhas.length > 0;
    }

    // Marca ou desmarca um curso como concluído
    static async marcarConcluido(usuarioId, progressoId, concluido) {
        const ehDele = await Trilha.ehDoUsuario(usuarioId, progressoId);
        if (!ehDele) {
            return false;
        }

        await db.query('UPDATE progresso SET concluido = ? WHERE id = ?', [concluido, progressoId]);
        return true;
    }

    // Adiciona um curso no fim da trilha (false se já estiver nela)
    static async adicionarCurso(usuarioId, cursoId) {
        const [trilhas] = await db.query('SELECT id FROM trilha WHERE usuario_id = ?', [usuarioId]);
        let trilhaId;

        if (trilhas.length > 0) {
            trilhaId = trilhas[0].id;
        } else {
            const [nova] = await db.query('INSERT INTO trilha (usuario_id) VALUES (?)', [usuarioId]);
            trilhaId = nova.insertId;
        }

        const [repetido] = await db.query(
            'SELECT id FROM progresso WHERE trilha_id = ? AND curso_id = ?',
            [trilhaId, cursoId]
        );
        if (repetido.length > 0) {
            return false;
        }

        // entra depois do último curso da trilha
        const [ultima] = await db.query(
            'SELECT IFNULL(MAX(ordem_sugerida), 0) AS ordem FROM progresso WHERE trilha_id = ?',
            [trilhaId]
        );

        await db.query(
            'INSERT INTO progresso (trilha_id, curso_id, ordem_sugerida) VALUES (?, ?, ?)',
            [trilhaId, cursoId, ultima[0].ordem + 1]
        );
        return true;
    }

    static async removerCurso(usuarioId, progressoId) {
        const ehDele = await Trilha.ehDoUsuario(usuarioId, progressoId);
        if (!ehDele) {
            return false;
        }

        await db.query('DELETE FROM progresso WHERE id = ?', [progressoId]);
        return true;
    }
}

module.exports = Trilha;
