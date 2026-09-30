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
    titulo VARCHAR(150) NOT NULL,
    empresa VARCHAR(150) NOT NULL,
    cidade VARCHAR(100),
    bolsa DECIMAL(10,2),
    modalidade VARCHAR(50),
    data_verificacao DATE,
    status VARCHAR(20) DEFAULT 'ativo' -- Permite manter vagas inativas para preservar o cálculo de progresso anterior
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
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);

-- 9. Tabela de acompanhamento da rotina de aprendizado
CREATE TABLE progresso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trilha_id INT NOT NULL,
    curso_id INT NOT NULL,
    ordem_sugerida INT NOT NULL,
    concluido BOOLEAN DEFAULT FALSE, -- Identifica pendência ou encerramento pelo botão de conclusão na interface
    FOREIGN KEY (trilha_id) REFERENCES trilha(id),
    FOREIGN KEY (curso_id) REFERENCES curso(id)
);
