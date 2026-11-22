// Tela de login

// já logado
if (Sessao.estaLogado()) {
    window.location.href = Sessao.paginaInicial();
}

const formLogin = document.getElementById('form-login');
const campoEmail = document.getElementById('email');
const campoSenha = document.getElementById('password');
const mensagem = document.getElementById('mensagem');

formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = campoEmail.value.trim();
    const senha = campoSenha.value;

    if (!email || !senha) {
        mostrarMensagem(mensagem, 'Preencha e-mail e senha.', 'erro');
        return;
    }

    try {
        const resposta = await Api.post('/usuarios/login', { email, senha });
        Sessao.salvar(resposta.token, resposta.usuario);

        // empresa e administrador têm o próprio painel
        if (resposta.usuario.perfil !== 'jovem') {
            window.location.href = Sessao.paginaInicial();
        } else if (resposta.usuario.diagnosticoFeito) {
            window.location.href = 'inicio.html';
        } else {
            // primeiro acesso do jovem vai para o diagnóstico
            window.location.href = 'diagnostico-1.html';
        }
    } catch (erro) {
        mostrarMensagem(mensagem, erro.message, 'erro');
    }
});
