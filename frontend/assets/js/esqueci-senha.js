// Tela de recuperar senha

const formSenha = document.getElementById('form-senha');
const campoEmail = document.getElementById('email');
const mensagem = document.getElementById('mensagem');

formSenha.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!campoEmail.value.includes('@')) {
        mostrarMensagem(mensagem, 'Digite um e-mail válido.', 'erro');
        return;
    }

    mostrarMensagem(mensagem, 'Se o e-mail estiver cadastrado, você vai receber as instruções em alguns minutos.', 'sucesso');
    formSenha.reset();
});
