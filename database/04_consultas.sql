-- Consultas do Startpoint
-- Trocar o usuario_id = 1 pelo id do usuário que quiser testar

USE startpoint_db;


-- CONSULTAS USADAS NAS TELAS

-- 1) Catálogo de cursos ativos com a instituição (tela Cursos)
SELECT c.nome, c.area, c.modalidade, c.duracao, c.periodo_de_inscricao, i.nome AS instituicao
FROM curso c
INNER JOIN instituicao i ON i.id = c.instituicao_id
WHERE c.status = 'ativo'
ORDER BY c.area, c.nome;

-- 2) Áreas que têm curso, sem repetir (filtro de área da tela Vagas)
SELECT DISTINCT area
FROM curso
WHERE status = 'ativo'
ORDER BY area;

-- 3) Trilha de um usuário na ordem sugerida, com a situação de cada curso (tela Trilha)
SELECT p.ordem_sugerida, c.nome, i.nome AS instituicao, c.duracao,
       IF(p.concluido, 'Concluído', 'A fazer') AS situacao
FROM trilha t
INNER JOIN progresso p ON p.trilha_id = t.id
INNER JOIN curso c ON c.id = p.curso_id
INNER JOIN instituicao i ON i.id = c.instituicao_id
WHERE t.usuario_id = 1
ORDER BY p.ordem_sugerida;

-- 4) Percentual da trilha concluído
SELECT COUNT(*) AS total_cursos,
       SUM(p.concluido) AS concluidos,
       ROUND(SUM(p.concluido) / COUNT(*) * 100) AS percentual
FROM trilha t
INNER JOIN progresso p ON p.trilha_id = t.id
WHERE t.usuario_id = 1;

-- 5) Competências do usuário (diagnóstico + cursos concluídos)
SELECT c.nome
FROM usuario_competencia uc
INNER JOIN competencia c ON c.id = uc.competencia_id
WHERE uc.usuario_id = 1
UNION
SELECT c.nome
FROM progresso p
INNER JOIN trilha t ON t.id = p.trilha_id
INNER JOIN curso_competencia cc ON cc.curso_id = p.curso_id
INNER JOIN competencia c ON c.id = cc.competencia_id
WHERE t.usuario_id = 1 AND p.concluido = TRUE;

-- 6) Aderência do usuário a cada vaga (requisitos atendidos / total)
SELECT v.titulo, v.empresa, v.bolsa,
       COUNT(*) AS total_requisitos,
       SUM(CASE WHEN vc.competencia_id IN (SELECT competencia_id FROM usuario_competencia
                                           WHERE usuario_id = 1) THEN 1 ELSE 0 END) AS atendidos,
       ROUND(SUM(CASE WHEN vc.competencia_id IN (SELECT competencia_id FROM usuario_competencia
                                                 WHERE usuario_id = 1) THEN 1 ELSE 0 END) / COUNT(*) * 100) AS aderencia
FROM vaga v
INNER JOIN vaga_competencia vc ON vc.vaga_id = v.id
WHERE v.status = 'ativo'
GROUP BY v.id, v.titulo, v.empresa, v.bolsa
ORDER BY aderencia DESC;

-- 7) Requisitos que faltam para uma vaga
SELECT c.nome AS competencia, vc.tipo_requisito
FROM vaga_competencia vc
INNER JOIN competencia c ON c.id = vc.competencia_id
WHERE vc.vaga_id = 1
  AND vc.competencia_id NOT IN (SELECT competencia_id FROM usuario_competencia
                                WHERE usuario_id = 1);

-- 8) Competências pedidas pelas vagas de uma área e em quantas vagas aparecem (base da trilha)
SELECT c.nome, COUNT(*) AS vagas_que_pedem,
       SUM(CASE WHEN vc.tipo_requisito = 'obrigatoria' THEN 1 ELSE 0 END) AS como_obrigatoria
FROM vaga_competencia vc
INNER JOIN vaga v ON v.id = vc.vaga_id
INNER JOIN competencia c ON c.id = vc.competencia_id
WHERE v.area = 'Logística' AND v.status = 'ativo'
GROUP BY c.id, c.nome
ORDER BY vagas_que_pedem DESC;


-- OUTRAS CONSULTAS

-- 9) Quantidade de cursos ativos por área
SELECT area, COUNT(*) AS quantidade
FROM curso
WHERE status = 'ativo'
GROUP BY area;

-- 10) Áreas com pelo menos 4 cursos ativos
SELECT area, COUNT(*) AS quantidade
FROM curso
WHERE status = 'ativo'
GROUP BY area
HAVING COUNT(*) >= 4;

-- 11) Cursos verificados há mais de 15 dias
SELECT nome, data_verificacao,
       DATEDIFF(NOW(), data_verificacao) AS dias_sem_verificar
FROM curso
WHERE DATEDIFF(NOW(), data_verificacao) > 15
ORDER BY dias_sem_verificar DESC;

-- 12) Média, maior e menor bolsa das vagas por área
SELECT area,
       ROUND(AVG(bolsa), 2) AS media_bolsa,
       MAX(bolsa) AS maior_bolsa,
       MIN(bolsa) AS menor_bolsa
FROM vaga
WHERE status = 'ativo'
GROUP BY area;

-- 13) Vagas com bolsa entre R$ 800 e R$ 1.000
SELECT titulo, empresa, bolsa
FROM vaga
WHERE bolsa BETWEEN 800 AND 1000
ORDER BY bolsa DESC;

-- 14) As 3 vagas com a maior bolsa
SELECT titulo, empresa, bolsa
FROM vaga
WHERE status = 'ativo'
ORDER BY bolsa DESC
LIMIT 3;

-- 15) Cursos com uma palavra no nome ou na instituição (LIKE)
SELECT c.nome, i.nome AS instituicao, c.duracao, c.modalidade
FROM curso c
INNER JOIN instituicao i ON i.id = c.instituicao_id
WHERE c.status = 'ativo'
  AND (c.nome LIKE '%dados%' OR i.nome LIKE '%dados%');

-- 16) Instituições que têm pelo menos um curso ativo
SELECT nome
FROM instituicao i
WHERE EXISTS (SELECT 1 FROM curso c WHERE c.instituicao_id = i.id AND c.status = 'ativo');

-- 17) Curso e instituição numa coluna só
SELECT CONCAT(c.nome, ' - ', i.nome) AS curso_completo
FROM curso c
INNER JOIN instituicao i ON i.id = c.instituicao_id;

-- 18) Usuários que ainda não fizeram o diagnóstico
SELECT nome_completo, email
FROM usuario
WHERE area_interesse IS NULL;

-- 19) Usuários que ainda não têm trilha
SELECT u.nome_completo
FROM usuario u
LEFT JOIN trilha t ON t.usuario_id = u.id
WHERE t.id IS NULL;

-- 20) Quantidade de cursos concluídos por usuário
SELECT u.nome_completo, IFNULL(SUM(p.concluido), 0) AS cursos_concluidos
FROM usuario u
LEFT JOIN trilha t ON t.usuario_id = u.id
LEFT JOIN progresso p ON p.trilha_id = t.id
GROUP BY u.id, u.nome_completo;


-- MANIPULAÇÃO DE DADOS

-- 21) Adicionar curso na trilha
-- INSERT INTO progresso (trilha_id, curso_id, ordem_sugerida) VALUES (1, 5, 6);

-- 22) Marcar curso como concluído
-- UPDATE progresso SET concluido = TRUE WHERE id = 1;

-- 23) Remover curso da trilha
-- DELETE FROM progresso WHERE id = 1;

-- 24) Desativar curso com inscrições encerradas
-- UPDATE curso SET status = 'inativo', periodo_de_inscricao = 'Inscrições encerradas'
-- WHERE id = 18;

-- 25) Atualizar data de verificação da vaga
-- UPDATE vaga SET data_verificacao = CURDATE() WHERE id = 1;
