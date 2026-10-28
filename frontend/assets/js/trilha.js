// Tela Minha trilha

Sessao.exigirLogin();

const lista = document.getElementById('lista-trilha');
const mensagem = document.getElementById('mensagem');

async function carregarTrilha() {
    try {
        const trilha = await Api.get('/trilha');

        document.getElementById('percentual').textContent = trilha.percentual + '%';
        document.getElementById('barra-trilha').value = trilha.percentual;
        document.getElementById('aderencia').textContent = trilha.aderenciaMedia + '% de aderência média';

        lista.innerHTML = '';

        if (trilha.cursos.length === 0) {
            mostrarMensagem(mensagem, 'Ainda não temos cursos cadastrados para a sua área. Veja o catálogo e adicione os que quiser.');
            return;
        }

        trilha.cursos.forEach(dados => {
            const item = new ItemTrilha(dados);
            lista.append(item.criarItem(marcarConcluido, removerDaTrilha));
        });
    } catch (erro) {
        mostrarMensagem(mensagem, erro.message, 'erro');
    }
}

// botão "Marcar como concluído" / "Desmarcar"
async function marcarConcluido(item) {
    try {
        await Api.patch('/trilha/progresso/' + item.progressoId, { concluido: !item.concluido });
        carregarTrilha();
    } catch (erro) {
        mostrarMensagem(mensagem, erro.message, 'erro');
    }
}

async function removerDaTrilha(item) {
    if (!confirm(`Remover "${item.nome}" da sua trilha?`)) {
        return;
    }

    try {
        await Api.delete('/trilha/cursos/' + item.progressoId);
        carregarTrilha();
    } catch (erro) {
        mostrarMensagem(mensagem, erro.message, 'erro');
    }
}

carregarTrilha();
