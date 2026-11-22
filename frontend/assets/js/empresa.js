// Tela Minhas vagas (empresa)

const liberado = Sessao.exigirLogin(['empresa']);

const listaVagas = document.getElementById('lista-vagas-gestao');
const mensagem = document.getElementById('mensagem');


async function carregarVagas() {
    try {
        const vagas = await Api.get('/vagas/gestao');

        listaVagas.innerHTML = '';

        if (vagas.length === 0) {
            mostrarMensagem(mensagem, 'Você ainda não cadastrou nenhuma vaga.');
            return;
        }

        vagas.forEach(dados => {
            const vaga = new VagaGestao(dados);
            const acoes = [{ texto: 'Editar', link: 'cadastrar_vaga.html?id=' + vaga.id }];

            // a empresa pode encerrar uma vaga publicada ou que ainda aguarda aprovação
            if (vaga.status === 'ativo' || vaga.status === 'pendente') {
                acoes.push({ texto: 'Encerrar', classe: 'acao-perigo', aoClicar: encerrar });
            }

            listaVagas.append(vaga.criarItem(acoes));
        });
    } catch (erro) {
        mostrarMensagem(mensagem, erro.message, 'erro');
    }
}

async function encerrar(vaga) {
    if (!confirm('Encerrar a vaga "' + vaga.titulo() + '"? Ela deixa de aparecer para os jovens.')) {
        return;
    }

    try {
        await Api.patch('/vagas/' + vaga.id + '/status', { status: 'inativo' });
        mostrarMensagem(mensagem, 'Vaga encerrada.', 'sucesso');
        carregarVagas();
    } catch (erro) {
        mostrarMensagem(mensagem, erro.message, 'erro');
    }
}

if (liberado) {
    document.getElementById('nome-empresa').textContent = Sessao.usuario().nome;
    carregarVagas();
}
