// Tela de criar conta

const formCadastro = document.getElementById('form-cadastro');
const campoNome = document.getElementById('name');
const campoEmail = document.getElementById('email');
const campoSenha = document.getElementById('password');
const campoConfirmar = document.getElementById('confirmar-senha');
const mensagem = document.getElementById('mensagem');
const rotuloNome = document.getElementById('rotulo-nome');

function perfilEscolhido() {
    return document.querySelector('input[name="perfil"]:checked').value;
}

// empresa informa o nome da empresa
document.querySelectorAll('input[name="perfil"]').forEach(opcao => {
    opcao.addEventListener('change', () => {
        const empresa = perfilEscolhido() === 'empresa';
        rotuloNome.textContent = empresa ? 'Nome da empresa' : 'Nome completo';
        campoNome.placeholder = empresa ? 'Ex.: Empresa Horizonte' : 'Como você quer ser chamado?';
    });
});

// devolve a mensagem do primeiro erro (ou vazio)
function validarCadastro() {
    if (campoNome.value.trim().length < 3) {
        return perfilEscolhido() === 'empresa'
            ? 'Informe o nome da empresa (mínimo 3 letras).'
            : 'Informe seu nome (mínimo 3 letras).';
    }
    if (!campoEmail.value.includes('@')) {
        return 'Informe um e-mail válido.';
    }
    if (campoSenha.value.length < 6) {
        return 'A senha precisa ter pelo menos 6 caracteres.';
    }
    if (campoSenha.value !== campoConfirmar.value) {
        return 'As senhas não são iguais.';
    }
    return '';
}

// confirmação de senha
campoConfirmar.addEventListener('input', () => {
    const diferente = campoConfirmar.value !== '' && campoConfirmar.value !== campoSenha.value;
    campoConfirmar.classList.toggle('campo-erro', diferente);
});

formCadastro.addEventListener('submit', async (e) => {
    e.preventDefault();

    const erro = validarCadastro();
    if (erro) {
        mostrarMensagem(mensagem, erro, 'erro');
        return;
    }

    try {
        await Api.post('/usuarios', {
            nome: campoNome.value.trim(),
            email: campoEmail.value.trim(),
            senha: campoSenha.value,
            perfil: perfilEscolhido()
        });

        mostrarMensagem(mensagem, 'Conta criada! Agora é só entrar.', 'sucesso');
        formCadastro.reset();

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    } catch (erro) {
        mostrarMensagem(mensagem, erro.message, 'erro');
    }
});
