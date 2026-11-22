// Endereço da API
// Quando as telas são abertas pelo próprio servidor (porta 3000), usa o mesmo endereço da página.
// Assim funciona com localhost, 127.0.0.1 e Docker. Abrindo o HTML direto, usa localhost:3000.
const API_URL = (window.location.protocol.startsWith('http') && window.location.port === '3000')
    ? '/api'
    : 'http://localhost:3000/api';

// Dados do login no localStorage
class Sessao {

    static salvar(token, usuario) {
        localStorage.setItem('token', token);
        localStorage.setItem('usuario', JSON.stringify(usuario));
    }

    static token() {
        return localStorage.getItem('token');
    }

    static usuario() {
        return JSON.parse(localStorage.getItem('usuario'));
    }

    static estaLogado() {
        return this.token() !== null;
    }

    static sair() {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        localStorage.removeItem('diagnostico');
        window.location.href = 'login.html';
    }

    // jovem, empresa ou admin (contas antigas não tinham o campo: são jovens)
    static perfil() {
        const usuario = this.usuario();
        return usuario && usuario.perfil ? usuario.perfil : 'jovem';
    }

    // tela inicial de cada tipo de conta
    static paginaInicial() {
        if (this.perfil() === 'admin') return 'admin.html';
        if (this.perfil() === 'empresa') return 'empresa.html';
        return 'inicio.html';
    }

    // usada nas telas que precisam de login
    // sem parâmetro a tela é só do jovem; ex.: Sessao.exigirLogin(['empresa', 'admin'])
    // devolve false quando precisou mandar a pessoa para outra tela
    static exigirLogin(perfis) {
        if (!this.estaLogado()) {
            window.location.href = 'login.html';
            return false;
        }

        const permitidos = perfis || ['jovem'];
        if (!permitidos.includes(this.perfil())) {
            window.location.href = this.paginaInicial();
            return false;
        }
        return true;
    }
}

// Requisições para a API
class Api {

    static async requisicao(metodo, caminho, dados) {
        const opcoes = {
            method: metodo,
            headers: { 'Content-Type': 'application/json' }
        };

        if (Sessao.token()) {
            opcoes.headers['Authorization'] = 'Bearer ' + Sessao.token();
        }
        if (dados) {
            opcoes.body = JSON.stringify(dados);
        }

        let resposta;
        try {
            resposta = await fetch(API_URL + caminho, opcoes);
        } catch (erro) {
            throw new Error('Não foi possível conectar ao servidor. Confira se o back-end está rodando.');
        }

        const json = await resposta.json();

        // token inválido: volta pro login
        if (resposta.status === 401 && caminho !== '/usuarios/login') {
            Sessao.sair();
        }

        if (!resposta.ok) {
            throw new Error(json.erro || 'Algo deu errado. Tente de novo.');
        }

        return json;
    }

    static get(caminho) {
        return this.requisicao('GET', caminho);
    }

    static post(caminho, dados) {
        return this.requisicao('POST', caminho, dados);
    }

    static put(caminho, dados) {
        return this.requisicao('PUT', caminho, dados);
    }

    static patch(caminho, dados) {
        return this.requisicao('PATCH', caminho, dados);
    }

    static delete(caminho) {
        return this.requisicao('DELETE', caminho);
    }
}
