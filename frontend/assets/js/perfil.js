// Tela Perfil

Sessao.exigirLogin();

const mensagem = document.getElementById('mensagem');

// iniciais do nome
function iniciais(nome) {
    const partes = nome.trim().split(' ');
    const primeira = partes[0][0];
    const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
    return (primeira + ultima).toUpperCase();
}

async function carregarPerfil() {
    try {
        const perfil = await Api.get('/usuarios/perfil');

        document.getElementById('nome-usuario').textContent = perfil.nome_completo.split(' ')[0];
        document.getElementById('iniciais-usuario').textContent = iniciais(perfil.nome_completo);
        document.getElementById('nome-perfil').textContent = perfil.nome_completo;
        document.getElementById('email-perfil').textContent = perfil.email;

        document.getElementById('escolaridade-usuario').textContent = perfil.escolaridade || 'Não informado';
        document.getElementById('regiao-usuario').textContent = perfil.regiao || 'Não informada';
        document.getElementById('area-usuario').textContent = perfil.area_interesse || 'Não informada';
        document.getElementById('cursos-anteriores').textContent =
            perfil.competencias.length > 0 ? perfil.competencias.join(', ') : 'Nenhum ainda';

        const total = perfil.cursos_concluidos;
        document.getElementById('cursos-concluidos').textContent = total + (total === 1 ? ' curso' : ' cursos');

        // respostas para editar o diagnóstico
        localStorage.setItem('diagnostico', JSON.stringify({
            escolaridade: perfil.escolaridade,
            competencias: perfil.competencias,
            regiao: perfil.regiao,
            area: perfil.area_interesse
        }));
    } catch (erro) {
        mostrarMensagem(mensagem, erro.message, 'erro');
    }
}

document.getElementById('btn-editar').addEventListener('click', () => {
    window.location.href = 'diagnostico-1.html';
});

carregarPerfil();
