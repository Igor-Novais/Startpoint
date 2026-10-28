// Diagnóstico (usado nas 4 etapas)

Sessao.exigirLogin();

class Diagnostico {

    constructor() {
        this.respostas = JSON.parse(localStorage.getItem('diagnostico')) || {};
    }

    guardar(chave, valor) {
        this.respostas[chave] = valor;
        localStorage.setItem('diagnostico', JSON.stringify(this.respostas));
    }

    // envia o diagnóstico e gera a trilha
    async enviar() {
        await Api.put('/usuarios/diagnostico', {
            escolaridade: this.respostas.escolaridade,
            competencias: this.respostas.competencias || [],
            regiao: this.respostas.regiao,
            area: this.respostas.area
        });

        await Api.post('/trilha');

        // atualiza o usuário salvo
        const usuario = Sessao.usuario();
        usuario.diagnosticoFeito = true;
        localStorage.setItem('usuario', JSON.stringify(usuario));
    }
}

const diagnostico = new Diagnostico();
const etapa = Number(document.body.dataset.etapa);
const mensagem = document.getElementById('mensagem');
const btnContinuar = document.getElementById('btn-continuar');
const btnVoltar = document.getElementById('btn-voltar');

// campo de cada etapa
const campos = {
    1: { nome: 'quest', chave: 'escolaridade' },
    2: { nome: 'aprendidos', chave: 'competencias' },
    3: { nome: 'cidade', chave: 'regiao' },
    4: { nome: 'area', chave: 'area' }
};

const campo = campos[etapa];
const opcoes = document.querySelectorAll(`input[name="${campo.nome}"]`);

// [1] marca as respostas já salvas
const salvo = diagnostico.respostas[campo.chave];
if (salvo) {
    opcoes.forEach(opcao => {
        if (etapa === 2) {
            opcao.checked = salvo.includes(opcao.value);

            // não marcou nada antes = "Nenhum ainda"
            if (salvo.length === 0 && opcao.value === 'nenhum') {
                opcao.checked = true;
            }
        } else {
            opcao.checked = opcao.value === salvo;
        }
    });
}

// [2] "Nenhum ainda" desmarca as outras opções
if (etapa === 2) {
    opcoes.forEach(opcao => {
        opcao.addEventListener('change', () => {
            if (!opcao.checked) return;

            opcoes.forEach(outra => {
                if (opcao.value === 'nenhum' && outra !== opcao) outra.checked = false;
                if (opcao.value !== 'nenhum' && outra.value === 'nenhum') outra.checked = false;
            });
        });
    });
}

// [3] botão continuar
btnContinuar.addEventListener('click', async (e) => {
    e.preventDefault();

    const marcadas = [];
    opcoes.forEach(opcao => {
        if (opcao.checked) {
            marcadas.push(opcao.value);
        }
    });

    if (marcadas.length === 0) {
        mostrarMensagem(mensagem, 'Escolha uma opção para continuar.', 'erro');
        return;
    }

    if (etapa === 2) {
        diagnostico.guardar('competencias', marcadas.filter(v => v !== 'nenhum'));
    } else {
        diagnostico.guardar(campo.chave, marcadas[0]);
    }

    // última etapa
    if (etapa === 4) {
        btnContinuar.textContent = 'Gerando sua trilha...';
        try {
            await diagnostico.enviar();
        } catch (erro) {
            btnContinuar.textContent = 'Gerar minha trilha →';
            mostrarMensagem(mensagem, erro.message, 'erro');
            return;
        }
    }

    window.location.href = btnContinuar.getAttribute('href');
});

// voltar da etapa 1
if (etapa === 1) {
    btnVoltar.addEventListener('click', (e) => {
        e.preventDefault();
        history.back();
    });
}
