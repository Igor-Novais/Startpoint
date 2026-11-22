// Tela Cadastrar vaga (empresa e administrador)

const liberado = Sessao.exigirLogin(['empresa', 'admin']);

const formVaga = document.getElementById('form-vaga');
const campoEmpresa = document.getElementById('empresa');
const campoArea = document.getElementById('area');
const caixaObrigatorios = document.getElementById('requisitos-obrigatorios');
const caixaDesejaveis = document.getElementById('requisitos-desejaveis');
const mensagem = document.getElementById('mensagem');

const ehAdmin = Sessao.perfil() === 'admin';
const painel = Sessao.paginaInicial();

// ?id=5 na URL = editar a vaga 5
const vagaId = new URLSearchParams(window.location.search).get('id');
let competencias = [];

// links de voltar apontam para o painel certo
document.querySelectorAll('.link-painel').forEach(link => {
    link.href = painel;
});
// o administrador vê o mesmo menu das telas dele
if (ehAdmin) {
    const menu = document.querySelector('nav ul');
    menu.innerHTML = '';
    const itens = [
        ['admin.html', 'Painel'],
        ['admin_vagas.html', 'Vagas'],
        ['admin_cursos.html', 'Cursos'],
        ['cadastrar_vaga.html', 'Cadastrar vaga']
    ];
    itens.forEach(item => {
        const link = criarElemento('a', item[1]);
        link.href = item[0];
        if (item[0] === 'cadastrar_vaga.html') {
            link.setAttribute('aria-current', 'page');
        }
        const li = document.createElement('li');
        li.append(link);
        menu.append(li);
    });
    document.getElementById('nota-aprovacao').hidden = true;
}

// a empresa anuncia com o nome da conta; o administrador digita
if (liberado && !ehAdmin) {
    campoEmpresa.value = Sessao.usuario().nome;
    campoEmpresa.readOnly = true;
}

// mostra as competências da área escolhida e as de qualquer área
function mostrarCompetencias(obrigatorias, desejaveis) {
    const daArea = competencias.filter(c => c.area === 'Geral' || c.area === campoArea.value);

    if (!campoArea.value) {
        caixaObrigatorios.innerHTML = '';
        caixaDesejaveis.innerHTML = '';
        caixaObrigatorios.append(criarElemento('p', 'Escolha a área da vaga primeiro.'));
        return;
    }

    montarCompetencias(caixaObrigatorios, daArea, 'obrigatoria', obrigatorias);
    montarCompetencias(caixaDesejaveis, daArea, 'desejavel', desejaveis);
}

// uma competência não pode ser obrigatória e desejável ao mesmo tempo
formVaga.addEventListener('change', (e) => {
    const caixa = e.target;
    if (caixa.type !== 'checkbox' || !caixa.checked) {
        return;
    }

    const outroGrupo = caixa.name === 'obrigatoria' ? 'desejavel' : 'obrigatoria';
    const outra = document.querySelector('input[name="' + outroGrupo + '"][value="' + caixa.value + '"]');
    if (outra) {
        outra.checked = false;
    }
});

campoArea.addEventListener('change', () => {
    mostrarCompetencias(idsMarcados('obrigatoria'), idsMarcados('desejavel'));
});

async function iniciar() {
    try {
        const opcoes = await Api.get('/vagas/opcoes');
        competencias = opcoes.competencias;

        opcoes.areas.forEach(area => {
            const opcao = criarElemento('option', area);
            opcao.value = area;
            campoArea.append(opcao);
        });

        if (vagaId) {
            await carregarVaga();
        } else {
            mostrarCompetencias([], []);
        }
    } catch (erro) {
        mostrarMensagem(mensagem, erro.message, 'erro');
    }
}

// preenche o formulário para editar
async function carregarVaga() {
    const vaga = await Api.get('/vagas/' + vagaId);

    document.getElementById('titulo-pagina').textContent = 'Editar vaga';
    document.getElementById('btn-publicar').textContent = 'Salvar alterações';

    campoEmpresa.value = vaga.empresa;
    document.getElementById('candidatura').value = vaga.link_candidatura || '';
    document.getElementById('titulo').value = vaga.titulo;
    campoArea.value = vaga.area;
    document.getElementById('descricao').value = vaga.descricao || '';
    document.getElementById('modalidade').value = vaga.modalidade || 'Presencial';
    document.getElementById('salario').value = vaga.bolsa || '';
    document.getElementById('quantidade').value = vaga.quantidade || 1;
    document.getElementById('beneficios').value = vaga.beneficios || '';
    document.getElementById('data-limite').value = vaga.data_limite ? vaga.data_limite.slice(0, 10) : '';

    const obrigatorias = vaga.requisitos.filter(r => r.tipo_requisito === 'obrigatoria').map(r => r.competencia_id);
    const desejaveis = vaga.requisitos.filter(r => r.tipo_requisito === 'desejavel').map(r => r.competencia_id);
    mostrarCompetencias(obrigatorias, desejaveis);
}

formVaga.addEventListener('submit', async (e) => {
    e.preventDefault();

    const obrigatorias = idsMarcados('obrigatoria');
    const desejaveis = idsMarcados('desejavel');

    if (obrigatorias.length === 0) {
        mostrarMensagem(mensagem, 'Marque pelo menos um requisito obrigatório.', 'erro');
        return;
    }

    const dados = {
        empresa: campoEmpresa.value.trim(),
        link_candidatura: document.getElementById('candidatura').value.trim(),
        titulo: document.getElementById('titulo').value.trim(),
        area: campoArea.value,
        descricao: document.getElementById('descricao').value.trim(),
        cidade: document.getElementById('cidade').value,
        modalidade: document.getElementById('modalidade').value,
        bolsa: document.getElementById('salario').value,
        quantidade: Number(document.getElementById('quantidade').value),
        beneficios: document.getElementById('beneficios').value.trim(),
        data_limite: document.getElementById('data-limite').value,
        requisitos: []
    };

    obrigatorias.forEach(id => {
        dados.requisitos.push({ competencia_id: id, tipo_requisito: 'obrigatoria' });
    });
    desejaveis.forEach(id => {
        dados.requisitos.push({ competencia_id: id, tipo_requisito: 'desejavel' });
    });

    try {
        const resposta = vagaId
            ? await Api.put('/vagas/' + vagaId, dados)
            : await Api.post('/vagas', dados);

        mostrarMensagem(mensagem, resposta.mensagem, 'sucesso');
        setTimeout(() => {
            window.location.href = painel;
        }, 1800);
    } catch (erro) {
        mostrarMensagem(mensagem, erro.message, 'erro');
    }
});

if (liberado) {
    iniciar();
}
