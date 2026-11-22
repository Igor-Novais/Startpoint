SET NAMES utf8mb4;
-- Criação do banco Startpoint
-- Depois deste arquivo, rodar o 03_dados_exemplo.sql

-- Excluir base de dados - CUIDADO
DROP DATABASE IF EXISTS startpoint_db;
CREATE DATABASE startpoint_db;
USE startpoint_db;

-- 1. Tabela para o cadastro e dados essenciais do público
CREATE TABLE usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_completo VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL, -- Receberá a senha protegida em formato bcrypt
    escolaridade VARCHAR(100),
    regiao VARCHAR(100),
    area_interesse VARCHAR(100),
    perfil ENUM('jovem', 'empresa', 'admin') NOT NULL DEFAULT 'jovem', -- Tipo de conta: jovem, empresa que anuncia vagas ou administrador
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela para registrar os provedores (Senai, Senac, etc.)
CREATE TABLE instituicao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL
);

-- 3. Tabela com as oportunidades de qualificação montadas via base curada
CREATE TABLE curso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    instituicao_id INT NOT NULL,
    nome VARCHAR(150) NOT NULL,
    area VARCHAR(100) NOT NULL,
    modalidade VARCHAR(50) NOT NULL,
    duracao INT, -- Armazenamento em horas
    periodo_de_inscricao VARCHAR(100),
    link_oficial VARCHAR(255),
    data_verificacao DATE, -- Atende ao requisito de revisão quinzenal
    status VARCHAR(20) DEFAULT 'ativo', -- Preserva inscrições inativas sem excluí-las
    FOREIGN KEY (instituicao_id) REFERENCES instituicao(id)
);

-- 4. Tabela de taxonomia unificada
CREATE TABLE competencia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    area VARCHAR(100) NOT NULL
);

-- 5. Tabela associativa entre os conteúdos das aulas e o vocabulário padronizado
CREATE TABLE curso_competencia (
    curso_id INT NOT NULL,
    competencia_id INT NOT NULL,
    PRIMARY KEY (curso_id, competencia_id),
    FOREIGN KEY (curso_id) REFERENCES curso(id),
    FOREIGN KEY (competencia_id) REFERENCES competencia(id)
);

-- 6. Tabela das oportunidades reais listadas nas interfaces
CREATE TABLE vaga (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT, -- Conta da empresa que cadastrou a vaga (vazio quando foi o administrador)
    titulo VARCHAR(150) NOT NULL,
    empresa VARCHAR(150) NOT NULL,
    area VARCHAR(100) NOT NULL,
    descricao TEXT,
    cidade VARCHAR(100),
    bolsa DECIMAL(10,2),
    modalidade VARCHAR(50),
    quantidade INT DEFAULT 1,
    beneficios VARCHAR(255),
    data_limite DATE, -- Depois dessa data a vaga sai da lista
    link_candidatura VARCHAR(255),
    data_verificacao DATE,
    status VARCHAR(20) DEFAULT 'ativo', -- pendente (aguarda o administrador), ativo, inativo ou recusada
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE SET NULL
);

-- 7. Tabela associativa definindo os critérios preenchidos pela vaga
CREATE TABLE vaga_competencia (
    vaga_id INT NOT NULL,
    competencia_id INT NOT NULL,
    tipo_requisito ENUM('obrigatoria', 'desejavel') NOT NULL, -- Regra definida pelas análises de amostra
    PRIMARY KEY (vaga_id, competencia_id),
    FOREIGN KEY (vaga_id) REFERENCES vaga(id),
    FOREIGN KEY (competencia_id) REFERENCES competencia(id)
);

-- 8. Tabela da estrutura base de estudo atribuída a um jovem específico
CREATE TABLE trilha (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    data_geracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
);

-- 9. Tabela de acompanhamento da rotina de aprendizado
CREATE TABLE progresso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trilha_id INT NOT NULL,
    curso_id INT NOT NULL,
    ordem_sugerida INT NOT NULL,
    concluido BOOLEAN DEFAULT FALSE, -- Identifica pendência ou encerramento pelo botão de conclusão na interface
    FOREIGN KEY (trilha_id) REFERENCES trilha(id) ON DELETE CASCADE,
    FOREIGN KEY (curso_id) REFERENCES curso(id)
);

-- 10. Tabela associativa com o que o jovem já sabe (etapa 2 do diagnóstico)
CREATE TABLE usuario_competencia (
    usuario_id INT NOT NULL,
    competencia_id INT NOT NULL,
    PRIMARY KEY (usuario_id, competencia_id),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
    FOREIGN KEY (competencia_id) REFERENCES competencia(id)
);

-- Índices para os filtros de área e cidade
CREATE INDEX idx_curso_area ON curso(area);
CREATE INDEX idx_vaga_area ON vaga(area);
CREATE INDEX idx_vaga_cidade ON vaga(cidade);
CREATE INDEX idx_vaga_status ON vaga(status);
