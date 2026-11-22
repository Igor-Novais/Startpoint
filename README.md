# Startpoint

## Descrição
Aplicação web que monta uma trilha de cursos gratuitos até a primeira vaga de Jovem Aprendiz, focada em jovens de 16 a 24 anos de regiões periféricas.
O jovem responde um diagnóstico rápido, recebe a sequência de cursos que cobre o que as vagas da área pedem, acompanha o progresso e vê o quanto o perfil dele combina com cada vaga (% de aderência e "O que falta").

O sistema tem três tipos de conta:
- **Jovem:** diagnóstico, trilha, cursos e vagas.
- **Empresa:** cadastra e edita as próprias vagas de Jovem Aprendiz, com os requisitos obrigatórios e desejáveis. Toda vaga nova ou alterada fica "Aguardando aprovação".
- **Administrador:** aprova ou recusa as vagas das empresas, desativa e reativa vagas e cursos, e cadastra ou edita cursos.

Projeto Integrador da PUC-Campinas (Programação Web + Bancos de Dados Relacionais), Terceiro Setor, ODS 4, 8 e 10.

## Tecnologias Utilizadas
- HTML5, CSS3 e JavaScript (classes, Fetch API, localStorage)
- Node.js com Express (API REST)
- Banco de Dados: MySQL 8
- Autenticação: senha com hash bcrypt (biblioteca bcryptjs) e sessão com JWT

## Estrutura do Projeto
```
backend/
  src/
    config/        conexão com o MySQL
    controllers/   regras de cada rota (usuário, cursos, trilha, vagas)
    middlewares/   verificação do token JWT (auth.js) e do tipo de conta (perfil.js)
    models/        classes que fazem as consultas SQL
    routes/        endpoints da API
    server.js      sobe o servidor e entrega as telas
  testes/          teste automático da API
  Dockerfile       imagem da API para o Docker
database/
  01_criacao_tabelas.mwb   modelo no MySQL Workbench
  02_Startpoint_SQL.sql    criação das tabelas e índices
  03_dados_exemplo.sql     cursos, vagas e competências para teste
  04_consultas.sql         consultas e manipulação de dados para testar no Workbench
frontend/
  *.html           telas
  assets/css/      estilos de cada tela
  assets/js/       scripts (api.js, comum.js, modelos.js e um arquivo por tela)
documentos/        entregas do projeto
docker-compose.yml sobe o banco e a API no Docker
```

## Como rodar
1. No MySQL Workbench, abrir e executar `database/02_Startpoint_SQL.sql` e depois `database/03_dados_exemplo.sql`.
2. Na pasta `backend`, copiar o arquivo `.env.example` para `.env` e colocar a senha do seu MySQL.
3. Ainda na pasta `backend`:
   ```
   npm install
   npm start
   ```
4. Abrir no navegador: http://localhost:3000

Contas de teste (ou crie uma conta nova de jovem ou de empresa):

| Tipo | E-mail | Senha |
|---|---|---|
| Jovem | `ana@teste.com` | `123456` |
| Empresa | `empresa@teste.com` | `123456` |
| Administrador | `admin@startpoint.com` | `admin123` |

A conta de administrador não pode ser criada pela tela, só pelo banco.

Para rodar o teste da API, com o servidor ligado, abrir outro terminal na pasta `backend` e rodar `npm test`.

### Com Docker (opcional)
Não precisa instalar MySQL nem Node: só o Docker Desktop (no Windows ele pede o WSL, que se instala com `wsl --install` no PowerShell como administrador, seguido de reiniciar o computador).

1. Abrir o Docker Desktop e esperar aparecer "Engine running".
2. Abrir o PowerShell na pasta principal do projeto (a que tem o `docker-compose.yml`).
3. Rodar:
   ```
   docker compose up --build
   ```
   Na primeira vez baixa o MySQL e o Node e leva alguns minutos. Ele sobe o banco (já com o `02_Startpoint_SQL.sql` e o `03_dados_exemplo.sql`) e a API.
4. Abrir http://localhost:3000 (se não abrir, usar http://127.0.0.1:3000) e entrar com uma das contas de teste acima.

- Para rodar em segundo plano, sem deixar o terminal aberto: `docker compose up -d`.
- Para desligar: `docker compose down`.
- Para apagar o banco do Docker e começar do zero: `docker compose down -v`.
- O banco do Docker usa a porta 3307, então não briga com o MySQL instalado no computador. No Workbench: host `127.0.0.1`, porta `3307`, usuário `root`, senha `startpoint`.

## Endpoints
| Método | Rota | O que faz |
|---|---|---|
| POST | /api/usuarios | Cria conta |
| POST | /api/usuarios/login | Login, devolve o token |
| GET | /api/usuarios/perfil | Dados do usuário |
| PUT | /api/usuarios/diagnostico | Salva o diagnóstico |
| POST | /api/trilha | Gera a trilha |
| GET | /api/trilha | Trilha com progresso e aderência média |
| PATCH | /api/trilha/progresso/:id | Marca/desmarca curso concluído |
| POST | /api/trilha/cursos | Adiciona curso na trilha |
| DELETE | /api/trilha/cursos/:id | Remove curso da trilha |
| GET | /api/cursos | Catálogo de cursos ativos |
| GET | /api/cursos/areas | Áreas com curso |
| GET | /api/vagas | Vagas com aderência e "O que falta" (filtros: area, cidade) |
| GET | /api/vagas/cidades | Cidades com vaga |
| GET | /api/vagas/opcoes | Áreas e competências para o formulário de vaga (empresa e admin) |
| GET | /api/vagas/gestao | Vagas da empresa logada, ou todas para o admin |
| GET | /api/vagas/:id | Vaga com os requisitos, para editar (empresa dona e admin) |
| POST | /api/vagas | Cadastra vaga (empresa: fica pendente; admin: já publica) |
| PUT | /api/vagas/:id | Altera vaga (empresa dona e admin) |
| PATCH | /api/vagas/:id/status | Admin aprova, recusa, desativa ou reativa; empresa encerra a própria vaga |
| GET | /api/usuarios/resumo | Números do painel do administrador |
| GET | /api/cursos/todos | Todos os cursos, ativos e inativos (admin) |
| GET | /api/cursos/opcoes | Instituições, áreas e competências para o formulário de curso (admin) |
| GET | /api/cursos/:id | Curso com as competências, para editar (admin) |
| POST | /api/cursos | Cadastra curso (admin) |
| PUT | /api/cursos/:id | Altera curso (admin) |
| PATCH | /api/cursos/:id/status | Ativa ou desativa curso (admin) |

Com exceção do cadastro e do login, todas as rotas pedem o token no cabeçalho `Authorization: Bearer <token>`. As rotas de empresa e de administrador também conferem o tipo de conta (respondem 403 para quem não tem permissão).

## Banco de dados
10 tabelas relacionadas (54 atributos, 11 chaves estrangeiras), normalizadas até a 3FN, com índices na área do curso e na área, cidade e situação da vaga. O tipo de conta fica na coluna `perfil` da tabela `usuario`, e a vaga guarda qual conta de empresa a cadastrou (`vaga.usuario_id`).
Por enquanto o MVP atende a cidade de São Paulo.

## Protótipo
Figma Make: https://www.figma.com/make/q4EgNLn6MMgyzlzpJ5AGTR/Prototipo

## Integrantes
- Caio Furlan – Product Owner
- Bruno Teixeira Souto Maior – Scrum Master
- Conrado Marques – Front-end
- Igor Novais Ribeiro Santos – Banco de dados e repositório
- Otavio Astolfo Torato – Back-end, Kanban e documentação

## Status do Projeto
Em desenvolvimento – versão final (sistema integrado: front-end, API e banco, com áreas da empresa e do administrador).
Parcial: recuperação de senha (a tela existe, mas o envio do e-mail ainda não foi feito).
Cursos, vagas e empresas ainda são dados de exemplo, até a revisão com o parceiro.
Próximos passos: envio do e-mail de recuperação de senha e troca dos dados de exemplo pelos definitivos.
