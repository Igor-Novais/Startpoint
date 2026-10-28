// Tela Início

Sessao.exigirLogin();

async function carregarInicio() {
    // data de hoje
    const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    document.getElementById('data-hoje').textContent = hoje.toUpperCase();

    try {
        const perfil = await Api.get('/usuarios/perfil');

        // ainda não fez o diagnóstico
        if (!perfil.area_interesse) {
            window.location.href = 'diagnostico-1.html';
            return;
        }

        const primeiroNome = perfil.nome_completo.split(' ')[0];
        document.getElementById('saudacao').textContent = `Olá, ${primeiroNome}. Vamos avançar?`;

        const trilha = await Api.get('/trilha');
        mostrarResumo(trilha);
        mostrarProximo(trilha);
    } catch (erro) {
        document.getElementById('titulo-trilha').textContent = erro.message;
    }
}

function mostrarResumo(trilha) {
    let titulo = 'Você já começou bem';
    if (trilha.total === 0) titulo = 'Ainda não há cursos para a sua área';
    else if (trilha.concluidos === 0) titulo = 'Sua trilha está pronta';
    else if (trilha.percentual === 100) titulo = 'Trilha concluída!';

    document.getElementById('titulo-trilha').textContent = titulo;
    document.getElementById('percentual').textContent = trilha.percentual + '%';
    document.getElementById('cursos-concluidos').textContent =
        `${trilha.concluidos} de ${trilha.total} cursos concluídos`;
    document.getElementById('aderencia').textContent =
        `${trilha.aderenciaMedia}% de aderência às vagas`;

    // barra de progresso
    document.getElementById('cursos-concluidos').style.setProperty('--progresso', trilha.percentual + '%');
}

function mostrarProximo(trilha) {
    const nome = document.getElementById('proximo-nome');
    const info = document.getElementById('proximo-info');
    const link = document.getElementById('proximo-link');

    if (trilha.proximo) {
        nome.textContent = trilha.proximo.nome;
        info.textContent = `${trilha.proximo.instituicao} · ${trilha.proximo.duracao}h · ${trilha.proximo.modalidade}`;
    } else if (trilha.total > 0) {
        nome.textContent = 'Você concluiu todos os cursos!';
        info.textContent = 'Agora é hora de procurar sua vaga.';
        link.textContent = 'Ver vagas →';
        link.href = 'vagas.html';
    } else {
        nome.textContent = 'Escolha cursos no catálogo';
        info.textContent = 'Você pode montar sua trilha com os cursos que quiser.';
        link.textContent = 'Ver cursos →';
        link.href = 'cursos.html';
    }
}

carregarInicio();
