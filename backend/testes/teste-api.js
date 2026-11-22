// Teste da API (com o servidor rodando, usar: npm test)

const URL = 'http://localhost:3000/api';
let token = '';
let passou = 0;
let falhou = 0;

function confere(descricao, condicao) {
    if (condicao) {
        passou++;
        console.log('OK      ' + descricao);
    } else {
        falhou++;
        console.log('FALHOU  ' + descricao);
    }
}

async function chamar(metodo, caminho, corpo) {
    const resposta = await fetch(URL + caminho, {
        method: metodo,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: corpo ? JSON.stringify(corpo) : undefined
    });
    const dados = await resposta.json();
    return { status: resposta.status, dados };
}

async function testar() {
    const email = 'teste' + Date.now() + '@teste.com';

    // cadastro e login
    let r = await chamar('POST', '/usuarios', { nome: 'Usuário Teste', email, senha: '123456' });
    confere('cadastro cria o usuário (201)', r.status === 201);

    r = await chamar('POST', '/usuarios', { nome: 'Usuário Teste', email, senha: '123456' });
    confere('cadastro recusa e-mail repetido (409)', r.status === 409);

    r = await chamar('POST', '/usuarios/login', { email, senha: 'errada' });
    confere('login recusa senha errada (401)', r.status === 401);

    r = await chamar('POST', '/usuarios/login', { email, senha: '123456' });
    confere('login devolve token JWT', r.status === 200 && r.dados.token);
    token = r.dados.token;

    // rota protegida sem token
    const semToken = await fetch(URL + '/trilha');
    confere('rota protegida bloqueia sem token (401)', semToken.status === 401);

    // diagnóstico e trilha
    r = await chamar('PUT', '/usuarios/diagnostico', {
        escolaridade: 'Ensino médio cursando',
        regiao: 'São Paulo/SP',
        area: 'Logística',
        competencias: ['Informática básica']
    });
    confere('salva o diagnóstico', r.status === 200);

    r = await chamar('POST', '/trilha');
    confere('gera a trilha (201)', r.status === 201);

    r = await chamar('GET', '/trilha');
    confere('trilha tem cursos', r.dados.cursos.length > 0);
    const aderenciaAntes = r.dados.aderenciaMedia;
    const primeiro = r.dados.cursos[0];

    // progresso
    r = await chamar('PATCH', '/trilha/progresso/' + primeiro.progresso_id, { concluido: true });
    confere('marca curso como concluído', r.status === 200);

    r = await chamar('GET', '/trilha');
    confere('percentual da trilha subiu', r.dados.percentual > 0);
    confere('aderência às vagas subiu', r.dados.aderenciaMedia > aderenciaAntes);

    // catálogo e adicionar/remover curso
    r = await chamar('GET', '/cursos');
    confere('lista o catálogo de cursos', r.dados.length > 0);
    const cursoNovo = r.dados.find(c => c.area === 'Tecnologia' && !c.na_trilha);

    r = await chamar('POST', '/trilha/cursos', { cursoId: cursoNovo.id });
    confere('adiciona curso do catálogo na trilha', r.status === 201);

    r = await chamar('POST', '/trilha/cursos', { cursoId: cursoNovo.id });
    confere('não deixa adicionar o mesmo curso duas vezes (409)', r.status === 409);

    r = await chamar('GET', '/trilha');
    const adicionado = r.dados.cursos.find(c => c.curso_id === cursoNovo.id);
    r = await chamar('DELETE', '/trilha/cursos/' + adicionado.progresso_id);
    confere('remove curso da trilha', r.status === 200);

    // vagas
    r = await chamar('GET', '/vagas?area=Logística');
    confere('lista vagas com aderência', r.dados.length > 0 && r.dados[0].aderencia !== undefined);
    confere('vaga traz o bloco "o que falta"', Array.isArray(r.dados[0].falta));

    // perfil
    r = await chamar('GET', '/usuarios/perfil');
    confere('perfil mostra o diagnóstico salvo', r.dados.area_interesse === 'Logística');

    // empresa: cadastro, vaga enviada e permissões
    const tokenJovem = token;
    const emailEmpresa = 'empresa' + Date.now() + '@teste.com';
    r = await chamar('POST', '/usuarios', { nome: 'Empresa Teste', email: emailEmpresa, senha: '123456', perfil: 'empresa' });
    r = await chamar('POST', '/usuarios/login', { email: emailEmpresa, senha: '123456' });
    confere('empresa entra com perfil "empresa"', r.dados.usuario && r.dados.usuario.perfil === 'empresa');
    token = r.dados.token;

    r = await chamar('GET', '/vagas/opcoes');
    const competenciaLog = r.dados.competencias.find(c => c.area === 'Logística');
    r = await chamar('POST', '/vagas', {
        titulo: 'Aprendiz de Teste', area: 'Logística', descricao: 'Vaga criada pelo teste automático.',
        link_candidatura: 'rh@teste.com', bolsa: 700, quantidade: 1,
        requisitos: [{ competencia_id: competenciaLog.id, tipo_requisito: 'obrigatoria' }]
    });
    confere('empresa cadastra vaga e ela fica pendente', r.status === 201 && r.dados.status === 'pendente');
    const vagaNova = r.dados.id;

    r = await chamar('POST', '/vagas', { titulo: 'Sem requisito', area: 'Logística', descricao: 'Vaga sem requisito.', link_candidatura: 'x', quantidade: 1, requisitos: [] });
    confere('vaga sem requisito obrigatório é recusada (400)', r.status === 400);

    r = await chamar('PATCH', '/vagas/' + vagaNova + '/status', { status: 'ativo' });
    confere('empresa não consegue aprovar a própria vaga (400)', r.status === 400);

    r = await chamar('GET', '/usuarios/resumo');
    confere('empresa não acessa o painel do administrador (403)', r.status === 403);

    // administrador: aprova a vaga e gerencia cursos
    r = await chamar('POST', '/usuarios/login', { email: 'admin@startpoint.com', senha: 'admin123' });
    confere('administrador entra com perfil "admin"', r.dados.usuario && r.dados.usuario.perfil === 'admin');
    token = r.dados.token;

    r = await chamar('PATCH', '/vagas/' + vagaNova + '/status', { status: 'ativo' });
    confere('administrador aprova a vaga', r.status === 200);

    r = await chamar('GET', '/cursos/opcoes');
    r = await chamar('POST', '/cursos', {
        nome: 'Curso do teste automático', instituicao_id: r.dados.instituicoes[0].id, area: 'Logística',
        modalidade: 'Online', duracao: 8, link_oficial: 'https://www.exemplo.com', competencias: [competenciaLog.id]
    });
    confere('administrador cadastra curso', r.status === 201);
    const cursoTeste = r.dados.id;

    r = await chamar('PATCH', '/cursos/' + cursoTeste + '/status', { status: 'inativo' });
    confere('administrador desativa curso', r.status === 200);

    // o jovem passa a ver a vaga aprovada
    token = tokenJovem;
    r = await chamar('GET', '/vagas?area=Logística');
    confere('vaga aprovada aparece para o jovem', r.dados.some(v => v.id === vagaNova));

    r = await chamar('POST', '/cursos', { nome: 'Curso' });
    confere('jovem não cadastra curso (403)', r.status === 403);

    console.log(`\n${passou} testes passaram, ${falhou} falharam.`);
}

testar().catch(erro => {
    console.log('Erro ao testar. O servidor está rodando?', erro.message);
});
