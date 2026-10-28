// Usado em todas as telas

class Tema {

    constructor() {
        // [1] carrega o tema salvo
        if (localStorage.getItem('tema') === 'escuro') {
            document.body.classList.add('dark');
        }

        // [2] botão de alterar tema
        const botao = document.getElementById('btn-tema');
        if (botao) {
            botao.addEventListener('click', () => this.alternar());
        }
    }

    // [3] alterna e salva a escolha
    alternar() {
        document.body.classList.toggle('dark');
        const tema = document.body.classList.contains('dark') ? 'escuro' : 'claro';
        localStorage.setItem('tema', tema);
    }
}

new Tema();

// Botões que levam para outra tela
document.querySelectorAll('[data-ir]').forEach(botao => {
    botao.addEventListener('click', () => {
        window.location.href = botao.dataset.ir;
    });
});

// Sair da conta
document.querySelectorAll('[data-sair]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        Sessao.sair();
    });
});

// Mostra mensagem na tela
function mostrarMensagem(elemento, texto, tipo) {
    elemento.textContent = texto;
    elemento.classList.remove('erro', 'sucesso');
    if (tipo) {
        elemento.classList.add(tipo);
    }
}

// Cria um elemento com texto e classe
function criarElemento(tag, texto, classe) {
    const elemento = document.createElement(tag);
    if (texto) elemento.textContent = texto;
    if (classe) elemento.className = classe;
    return elemento;
}
