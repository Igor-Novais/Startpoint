// Telas do administrador: Painel (admin.html), Vagas (admin_vagas.html) e Cursos (admin_cursos.html)
// cada tela tem só uma parte dos elementos, então o script confere o que existe na página

const liberado = Sessao.exigirLogin(['admin']);

const mensagem = document.getElementById('mensagem');
const listaVagas = document.getElementById('lista-vagas-gestao');
const filtroVagas = document.getElementById('filtro-vagas');
const listaCursos = document.getElementById('lista-cursos');

const formCurso = document.getElementById('form-curso');
const mensagemCurso = document.getElementById('mensagem-curso');
let cursoEditando = null;
let opcoesCurso = null;

// Resumo

async function carregarResumo() {
    // só o Painel tem os números
    if (!document.getElementById('num-pendentes')) {
        return;
    }

    try {
        const resumo = await Api.get('/usuarios/resumo');
        document.getElementById('num-pendentes').textContent = resumo.vagas_pendentes;
        document.getElementById('num-vagas').textContent = resumo.vagas_ativas;
        document.getElementById('num-cursos').textContent = resumo.cursos_ativos;
        document.getElementById('num-jovens').textContent = resumo.jovens;
        document.getElementById('num-empresas').textContent = resumo.empresas;
    } catch (erro) {
        mostrarMensagem(mensagem, erro.message, 'erro');
    }
}

// Vagas

async function carregarVagas() {
    try {
        const vagas = await Api.get('/vagas/gestao');

        // no Painel aparecem só as que aguardam aprovação
        let filtro = 'pendente';
        if (filtroVagas) {
            filtro = filtroVagas.value;
        }

        listaVagas.innerHTML = '';
        const visiveis = vagas.filter(v => filtro === '' || v.status === filtro);

        if (visiveis.length === 0) {
            listaVagas.append(criarElemento('li', 'Nenhuma vaga nessa situação.', 'mensagem'));
            return;
        }

        visiveis.forEach(dados => {
            const vaga = new VagaGestao(dados);
            listaVagas.append(vaga.criarItem(acoesDaVaga(vaga)));
        });
    } catch (erro) {
        mostrarMensagem(mensagem, erro.message, 'erro');
    }
}

// botões de acordo com a situação da vaga
function acoesDaVaga(vaga) {
    const acoes = [];

    if (vaga.status === 'pendente') {
        acoes.push({ texto: 'Aprovar', classe: 'acao-principal', aoClicar: v => mudarVaga(v, 'ativo') });
        acoes.push({ texto: 'Recusar', classe: 'acao-perigo', aoClicar: v => mudarVaga(v, 'recusada') });
    } else if (vaga.status === 'ativo') {
        acoes.push({ texto: 'Desativar', classe: 'acao-perigo', aoClicar: v => mudarVaga(v, 'inativo') });
    } else {
        acoes.push({ texto: 'Reativar', aoClicar: v => mudarVaga(v, 'ativo') });
    }

    acoes.push({ texto: 'Editar', link: 'cadastrar_vaga.html?id=' + vaga.id });
    return acoes;
}

async function mudarVaga(vaga, status) {
    const textos = { ativo: 'publicar', inativo: 'desativar', recusada: 'recusar' };
    if (!confirm('Deseja ' + textos[status] + ' a vaga "' + vaga.titulo() + '"?')) {
        return;
    }

    try {
        await Api.patch('/vagas/' + vaga.id + '/status', { status });
        mostrarMensagem(mensagem, 'Vaga atualizada.', 'sucesso');
        carregarVagas();
        carregarResumo();
    } catch (erro) {
        mostrarMensagem(mensagem, erro.message, 'erro');
    }
}

// Cursos

async function carregarCursos() {
    try {
        const cursos = await Api.get('/cursos/todos');
        listaCursos.innerHTML = '';

        cursos.forEach(dados => {
            const curso = new CursoGestao(dados);
            const acoes = [{ texto: 'Editar', aoClicar: abrirFormCurso }];

            if (curso.status === 'ativo') {
                acoes.push({ texto: 'Desativar', classe: 'acao-perigo', aoClicar: c => mudarCurso(c, 'inativo') });
            } else {
                acoes.push({ texto: 'Reativar', aoClicar: c => mudarCurso(c, 'ativo') });
            }

            listaCursos.append(curso.criarItem(acoes));
        });
    } catch (erro) {
        mostrarMensagem(mensagem, erro.message, 'erro');
    }
}

async function mudarCurso(curso, status) {
    try {
        await Api.patch('/cursos/' + curso.id + '/status', { status });
        mostrarMensagem(mensagem, 'Curso atualizado.', 'sucesso');
        carregarCursos();
        carregarResumo();
    } catch (erro) {
        mostrarMensagem(mensagem, erro.message, 'erro');
    }
}

function preencherSelect(select, opcoes) {
    select.innerHTML = '';
    opcoes.forEach(opcao => {
        const item = criarElemento('option', opcao.texto);
        item.value = opcao.valor;
        select.append(item);
    });
}

// abre o formulário vazio (curso = undefined) ou com os dados do curso
async function abrirFormCurso(curso) {
    try {
        if (!opcoesCurso) {
            opcoesCurso = await Api.get('/cursos/opcoes');
            preencherSelect(document.getElementById('curso-instituicao'),
                opcoesCurso.instituicoes.map(i => ({ valor: i.id, texto: i.nome })));
            preencherSelect(document.getElementById('curso-area'),
                opcoesCurso.areas.map(a => ({ valor: a, texto: a })));
        }

        formCurso.reset();
        mostrarMensagem(mensagemCurso, '');
        let marcadas = [];
        cursoEditando = null;

        if (curso) {
            const dados = await Api.get('/cursos/' + curso.id);
            cursoEditando = dados.id;
            document.getElementById('curso-nome').value = dados.nome;
            document.getElementById('curso-instituicao').value = dados.instituicao_id;
            document.getElementById('curso-area').value = dados.area;
            document.getElementById('curso-modalidade').value = dados.modalidade;
            document.getElementById('curso-duracao').value = dados.duracao;
            document.getElementById('curso-inscricao').value = dados.periodo_de_inscricao || '';
            document.getElementById('curso-link').value = dados.link_oficial || '';
            marcadas = dados.competencias;
        }

        document.getElementById('titulo-form-curso').textContent = curso ? 'Editar curso' : 'Novo curso';
        montarCompetencias(document.getElementById('curso-competencias'), opcoesCurso.competencias,
            'curso-competencia', marcadas);

        formCurso.hidden = false;
        formCurso.scrollIntoView({ behavior: 'smooth' });
    } catch (erro) {
        mostrarMensagem(mensagem, erro.message, 'erro');
    }
}

// salva o curso novo ou editado
async function salvarCurso(e) {
    e.preventDefault();

    const dados = {
        nome: document.getElementById('curso-nome').value.trim(),
        instituicao_id: Number(document.getElementById('curso-instituicao').value),
        area: document.getElementById('curso-area').value,
        modalidade: document.getElementById('curso-modalidade').value,
        duracao: Number(document.getElementById('curso-duracao').value),
        periodo_de_inscricao: document.getElementById('curso-inscricao').value.trim(),
        link_oficial: document.getElementById('curso-link').value.trim(),
        competencias: idsMarcados('curso-competencia')
    };

    if (dados.competencias.length === 0) {
        mostrarMensagem(mensagemCurso, 'Marque pelo menos uma competência que o curso ensina.', 'erro');
        return;
    }

    try {
        if (cursoEditando) {
            await Api.put('/cursos/' + cursoEditando, dados);
        } else {
            await Api.post('/cursos', dados);
        }

        formCurso.hidden = true;
        mostrarMensagem(mensagem, 'Curso salvo.', 'sucesso');
        carregarCursos();
        carregarResumo();
    } catch (erro) {
        mostrarMensagem(mensagemCurso, erro.message, 'erro');
    }
}

if (formCurso) {
    formCurso.addEventListener('submit', salvarCurso);
    document.getElementById('btn-novo-curso').addEventListener('click', () => abrirFormCurso());
    document.getElementById('btn-cancelar-curso').addEventListener('click', () => {
        formCurso.hidden = true;
    });
}
if (filtroVagas) {
    filtroVagas.addEventListener('change', carregarVagas);
}

if (liberado) {
    carregarResumo();
    if (listaVagas) {
        carregarVagas();
    }
    if (listaCursos) {
        carregarCursos();
    }
}
