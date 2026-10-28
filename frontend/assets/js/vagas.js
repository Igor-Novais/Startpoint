// Tela Vagas

Sessao.exigirLogin();

const listaVagas = document.getElementById('lista-vagas');
const filtroCidade = document.getElementById('localizacao');
const filtroArea = document.getElementById('area');
const mensagem = document.getElementById('mensagem');

function adicionarOpcoes(select, valores) {
    valores.forEach(valor => {
        const opcao = criarElemento('option', valor);
        opcao.value = valor;
        select.append(opcao);
    });
}

// filtros (começa com a cidade e a área do usuário)
async function iniciar() {
    try {
        const cidades = await Api.get('/vagas/cidades');
        const areas = await Api.get('/cursos/areas');
        const perfil = await Api.get('/usuarios/perfil');

        adicionarOpcoes(filtroCidade, cidades);
        adicionarOpcoes(filtroArea, areas);

        if (cidades.includes(perfil.regiao)) filtroCidade.value = perfil.regiao;
        if (areas.includes(perfil.area_interesse)) filtroArea.value = perfil.area_interesse;

        carregarVagas();
    } catch (erro) {
        mostrarMensagem(mensagem, erro.message, 'erro');
    }
}

async function carregarVagas() {
    const cidade = encodeURIComponent(filtroCidade.value);
    const area = encodeURIComponent(filtroArea.value);

    try {
        const vagas = await Api.get('/vagas?cidade=' + cidade + '&area=' + area);

        listaVagas.innerHTML = '';
        mostrarMensagem(mensagem, '');

        if (vagas.length === 0) {
            mostrarMensagem(mensagem, 'Não encontramos vagas com esses filtros.');
            return;
        }

        vagas.forEach(dados => {
            const vaga = new Vaga(dados);
            listaVagas.append(vaga.criarCard(abrirCandidatura));
        });
    } catch (erro) {
        mostrarMensagem(mensagem, erro.message, 'erro');
    }
}

// botão "Quero me candidatar" (true = abre o site da vaga)
function abrirCandidatura(vaga) {
    if (vaga.cumpreTudo()) {
        return confirm('Você cumpre todos os requisitos desta vaga. Abrir o site para se candidatar?');
    }

    return confirm(`Ainda faltam ${vaga.falta.length} requisito(s) para esta vaga. ` +
        'Você pode se candidatar mesmo assim, mas concluir os cursos aumenta suas chances. Abrir o site da vaga?');
}

filtroCidade.addEventListener('change', carregarVagas);
filtroArea.addEventListener('change', carregarVagas);

iniciar();
