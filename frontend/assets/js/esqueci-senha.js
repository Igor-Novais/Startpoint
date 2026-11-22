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

    // o envio do e-mail ainda não foi feito (situação "Parcial" na documentação)
    mostrarMensagem(mensagem, 'O envio do e-mail de recuperação ainda está em desenvolvimento nesta versão. ' +
        'Por enquanto, fale com o administrador do Startpoint para recuperar o acesso.');
});
