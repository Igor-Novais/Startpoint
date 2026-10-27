-- Dados iniciais do Startpoint
-- Rodar depois do Startpoint_SQL.sql

USE startpoint_db;

-- Instituições
INSERT INTO instituicao (id, nome) VALUES
(1, 'Fundação Bradesco'),
(2, 'SENAI'),
(3, 'SENAC'),
(4, 'SEBRAE'),
(5, 'Escola Virtual de Governo');

-- Competências (Geral = qualquer área)
INSERT INTO competencia (id, nome, area) VALUES
(1, 'Informática básica', 'Geral'),
(2, 'Pacote Office', 'Geral'),
(3, 'Atendimento ao cliente', 'Geral'),
(4, 'Comunicação no trabalho', 'Geral'),
(5, 'Excel', 'Administrativo'),
(6, 'Rotinas administrativas', 'Administrativo'),
(7, 'Lógica de programação', 'Tecnologia'),
(8, 'HTML e CSS', 'Tecnologia'),
(9, 'Suporte técnico', 'Tecnologia'),
(10, 'Análise de dados', 'Tecnologia'),
(11, 'Controle de estoque', 'Logística'),
(12, 'Segurança na movimentação de materiais', 'Logística'),
(13, 'Expedição e recebimento', 'Logística'),
(14, 'Vendas e negociação', 'Varejo'),
(15, 'Operação de caixa', 'Varejo'),
(16, 'Primeiros socorros', 'Saúde'),
(17, 'Atendimento humanizado', 'Saúde'),
(18, 'Organização de ambientes de saúde', 'Saúde');

-- Cursos
INSERT INTO curso (id, instituicao_id, nome, area, modalidade, duracao, periodo_de_inscricao, link_oficial, data_verificacao, status) VALUES
(1, 1, 'Informática básica', 'Tecnologia', 'Online', 12, 'Inscrições abertas', 'https://www.ev.org.br', '2026-10-20', 'ativo'),
(2, 1, 'Excel na prática', 'Administrativo', 'Online', 20, 'Até 30 nov', 'https://www.ev.org.br', '2026-10-20', 'ativo'),
(3, 2, 'Comunicação no trabalho', 'Administrativo', 'Online', 12, 'Inscrições abertas', 'https://www.sp.senai.br', '2026-10-20', 'ativo'),
(4, 3, 'Rotinas administrativas', 'Administrativo', 'Presencial', 30, 'Até 20 nov', 'https://www.sp.senac.br', '2026-10-20', 'ativo'),
(5, 1, 'Lógica de programação', 'Tecnologia', 'Online', 15, 'Inscrições abertas', 'https://www.ev.org.br', '2026-10-20', 'ativo'),
(6, 3, 'Fundamentos de suporte técnico', 'Tecnologia', 'Presencial', 24, 'Até 22 nov', 'https://www.sp.senac.br', '2026-10-20', 'ativo'),
(7, 1, 'Desenvolvimento web com HTML e CSS', 'Tecnologia', 'Online', 20, 'Inscrições abertas', 'https://www.ev.org.br', '2026-10-20', 'ativo'),
(8, 5, 'Introdução à análise de dados', 'Tecnologia', 'Online', 15, 'Inscrições abertas', 'https://www.escolavirtual.gov.br', '2026-10-20', 'ativo'),
(9, 4, 'Vendas e negociação', 'Varejo', 'Online', 10, 'Até 18 dez', 'https://sebrae.com.br/sites/PortalSebrae/cursosonline', '2026-10-20', 'ativo'),
(10, 3, 'Operações de caixa', 'Varejo', 'Online', 12, 'Inscrições abertas', 'https://www.sp.senac.br', '2026-10-20', 'ativo'),
(11, 3, 'Noções de primeiros socorros', 'Saúde', 'Presencial', 16, 'Até 5 dez', 'https://www.sp.senac.br', '2026-10-20', 'ativo'),
(12, 3, 'Organização de ambientes de saúde', 'Saúde', 'Online', 8, 'Inscrições abertas', 'https://www.sp.senac.br', '2026-10-20', 'ativo'),
(13, 5, 'Humanização no atendimento em saúde', 'Saúde', 'Online', 12, 'Inscrições abertas', 'https://www.escolavirtual.gov.br', '2026-10-20', 'ativo'),
(14, 3, 'Controle de estoque', 'Logística', 'Presencial', 16, 'Até 28 nov', 'https://www.sp.senac.br', '2026-10-20', 'ativo'),
(15, 2, 'Segurança na movimentação de materiais', 'Logística', 'Presencial', 20, 'Até 12 dez', 'https://www.sp.senai.br', '2026-10-20', 'ativo'),
(16, 2, 'Logística: expedição e recebimento', 'Logística', 'Online', 14, 'Inscrições abertas', 'https://www.sp.senai.br', '2026-10-20', 'ativo'),
(17, 1, 'Pacote Office do zero', 'Administrativo', 'Online', 16, 'Inscrições abertas', 'https://www.ev.org.br', '2026-10-20', 'ativo'),
(18, 2, 'Excel avançado', 'Administrativo', 'Presencial', 24, 'Inscrições encerradas', 'https://www.sp.senai.br', '2026-10-20', 'inativo'),
(19, 3, 'Atendimento ao cliente', 'Varejo', 'Online', 8, 'Inscrições abertas', 'https://www.sp.senac.br', '2026-10-20', 'ativo');

-- O que cada curso ensina
INSERT INTO curso_competencia (curso_id, competencia_id) VALUES
(1, 1),
(2, 5), (2, 2),
(3, 4), (3, 3),
(4, 6),
(5, 7),
(6, 9), (6, 1),
(7, 8),
(8, 10), (8, 5),
(9, 14), (9, 3),
(10, 15),
(11, 16),
(12, 18),
(13, 17), (13, 3),
(14, 11),
(15, 12),
(16, 13),
(17, 2),
(18, 5),
(19, 3);

-- Vagas de aprendiz
INSERT INTO vaga (id, titulo, empresa, area, cidade, bolsa, modalidade, link_candidatura, data_verificacao, status) VALUES
(1, 'Aprendiz de Expedição', 'LogiSul Distribuidora', 'Logística', 'São Paulo/SP', 714.00, 'Presencial', 'https://portal.ciee.org.br', '2026-10-20', 'ativo'),
(2, 'Aprendiz de Estoque', 'Rota Brasil Transportes', 'Logística', 'São Paulo/SP', 980.00, 'Presencial', 'https://www.espro.org.br', '2026-10-20', 'ativo'),
(3, 'Aprendiz de Suporte de TI', 'Conecta TI Serviços', 'Tecnologia', 'São Paulo/SP', 1100.00, 'Híbrido', 'https://portal.ciee.org.br', '2026-10-20', 'ativo'),
(4, 'Aprendiz em Desenvolvimento Web', 'Vértice Sistemas', 'Tecnologia', 'São Paulo/SP', 1200.00, 'Remoto', 'https://www.espro.org.br', '2026-10-20', 'ativo'),
(5, 'Aprendiz Auxiliar Administrativo', 'Andrade Contabilidade', 'Administrativo', 'São Paulo/SP', 900.00, 'Presencial', 'https://portal.ciee.org.br', '2026-10-20', 'ativo'),
(6, 'Aprendiz de Recepção', 'Centro Empresarial Paulista', 'Administrativo', 'São Paulo/SP', 850.00, 'Presencial', 'https://www.espro.org.br', '2026-10-20', 'ativo'),
(7, 'Aprendiz de Vendas', 'Loja Ponto Certo', 'Varejo', 'São Paulo/SP', 820.00, 'Presencial', 'https://portal.ciee.org.br', '2026-10-20', 'ativo'),
(8, 'Aprendiz Operador de Caixa', 'Supermercado Bom Preço', 'Varejo', 'São Paulo/SP', 780.00, 'Presencial', 'https://www.espro.org.br', '2026-10-20', 'ativo'),
(9, 'Aprendiz de Recepção em Clínica', 'Clínica Bem Viver', 'Saúde', 'São Paulo/SP', 900.00, 'Presencial', 'https://portal.ciee.org.br', '2026-10-20', 'ativo'),
(10, 'Aprendiz de Apoio Hospitalar', 'Hospital Santa Clara', 'Saúde', 'São Paulo/SP', 950.00, 'Presencial', 'https://www.espro.org.br', '2026-10-20', 'ativo'),
(11, 'Aprendiz de Logística', 'LogiSul Distribuidora', 'Logística', 'São Paulo/SP', 800.00, 'Presencial', 'https://portal.ciee.org.br', '2026-09-15', 'inativo');

-- Requisitos de cada vaga
INSERT INTO vaga_competencia (vaga_id, competencia_id, tipo_requisito) VALUES
(1, 11, 'obrigatoria'), (1, 12, 'obrigatoria'), (1, 13, 'obrigatoria'), (1, 1, 'desejavel'),
(2, 11, 'obrigatoria'), (2, 12, 'obrigatoria'), (2, 2, 'desejavel'),
(3, 1, 'obrigatoria'), (3, 9, 'obrigatoria'), (3, 7, 'desejavel'), (3, 3, 'desejavel'),
(4, 7, 'obrigatoria'), (4, 8, 'obrigatoria'), (4, 1, 'obrigatoria'),
(5, 2, 'obrigatoria'), (5, 5, 'obrigatoria'), (5, 6, 'obrigatoria'), (5, 4, 'desejavel'),
(6, 3, 'obrigatoria'), (6, 2, 'obrigatoria'), (6, 4, 'obrigatoria'),
(7, 14, 'obrigatoria'), (7, 3, 'obrigatoria'), (7, 15, 'desejavel'),
(8, 15, 'obrigatoria'), (8, 3, 'obrigatoria'), (8, 1, 'desejavel'),
(9, 17, 'obrigatoria'), (9, 3, 'obrigatoria'), (9, 2, 'desejavel'), (9, 16, 'desejavel'),
(10, 18, 'obrigatoria'), (10, 16, 'obrigatoria'), (10, 17, 'obrigatoria'),
(11, 11, 'obrigatoria'), (11, 13, 'obrigatoria');

-- Usuário de teste (senha: 123456)
INSERT INTO usuario (nome_completo, email, senha_hash) VALUES
('Ana Souza', 'ana@teste.com', '$2a$10$eZ3LOoZz0sy1Ub0gj0caQuzWG6X.zvc7nIMCwECx9wmJy.O5dYUYy');
