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

    console.log(`\n${passou} testes passaram, ${falhou} falharam.`);
}

testar().catch(erro => {
    console.log('Erro ao testar. O servidor está rodando?', erro.message);
});
