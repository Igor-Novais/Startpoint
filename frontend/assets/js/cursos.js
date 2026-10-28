// Tela Cursos

Sessao.exigirLogin();

const listaCursos = document.getElementById('lista-cursos');
const mensagem = document.getElementById('mensagem');

async function carregarCursos() {
    try {
        const cursos = await Api.get('/cursos');

        listaCursos.innerHTML = '';
        if (cursos.length === 0) {
            mostrarMensagem(mensagem, 'Nenhum curso cadastrado.');
        }

        cursos.forEach(dados => {
            const curso = new Curso(dados);
            listaCursos.append(curso.criarCard(adicionarNaTrilha));
        });
    } catch (erro) {
        mostrarMensagem(mensagem, erro.message, 'erro');
    }
}

// botão "Adicionar à trilha"
async function adicionarNaTrilha(curso, botao) {
    botao.disabled = true;
    try {
        await Api.post('/trilha/cursos', { cursoId: curso.id });
        await carregarCursos();
        mostrarMensagem(mensagem, `"${curso.nome}" foi adicionado à sua trilha.`, 'sucesso');
    } catch (erro) {
        botao.disabled = false;
        mostrarMensagem(mensagem, erro.message, 'erro');
    }
}

carregarCursos();
