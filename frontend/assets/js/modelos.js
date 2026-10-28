// Classes dos dados da API

class Curso {

    constructor(dados) {
        this.id = dados.id;
        this.nome = dados.nome;
        this.area = dados.area;
        this.instituicao = dados.instituicao;
        this.duracao = dados.duracao;
        this.modalidade = dados.modalidade;
        this.inscricao = dados.periodo_de_inscricao;
        this.link = dados.link_oficial;
        this.naTrilha = dados.na_trilha == 1;
    }

    inscricoesAbertas() {
        return this.inscricao === 'Inscrições abertas';
    }

    // situação do curso
    situacao() {
        return this.inscricao;
    }

    // card da tela Cursos
    criarCard(aoAdicionar) {
        const card = criarElemento('article', null, 'course-card');

        const topo = criarElemento('div', null, 'course-card-top');
        topo.append(criarElemento('span', this.area, 'course-category'));
        if (this.naTrilha) {
            topo.append(criarElemento('span', '✓ Na trilha', 'course-na-trilha'));
        }

        const meta = criarElemento('div', null, 'course-meta');
        meta.append(criarElemento('span', '◷ ' + this.duracao + 'h'));
        meta.append(criarElemento('span', this.modalidade));

        const prazo = criarElemento('p', this.situacao(), 'course-deadline');
        if (this.inscricoesAbertas()) {
            prazo.classList.add('is-open');
        }

        const acoes = criarElemento('div', null, 'course-actions');

        const detalhes = criarElemento('a', 'Ver detalhes', 'course-link');
        detalhes.href = this.link;
        detalhes.target = '_blank';
        acoes.append(detalhes);

        if (!this.naTrilha) {
            const adicionar = criarElemento('button', 'Adicionar à trilha', 'details-button');
            adicionar.type = 'button';
            adicionar.addEventListener('click', () => aoAdicionar(this, adicionar));
            acoes.append(adicionar);
        }

        const rodape = criarElemento('div', null, 'course-card-bottom');
        rodape.append(prazo, acoes);

        card.append(topo, criarElemento('h2', this.nome), criarElemento('p', this.instituicao, 'course-provider'), meta, rodape);
        return card;
    }
}

// Curso dentro da trilha (herda de Curso)
class ItemTrilha extends Curso {

    constructor(dados) {
        super(dados);
        this.id = dados.curso_id;
        this.progressoId = dados.progresso_id;
        this.ordem = dados.ordem_sugerida;
        this.concluido = dados.concluido == 1;
    }

    // sobrescreve o método de Curso
    situacao() {
        if (this.concluido) {
            return 'Concluído';
        }
        return super.situacao();
    }

    // item da tela Trilha
    criarItem(aoMarcar, aoRemover) {
        const item = document.createElement('li');
        if (this.concluido) {
            item.classList.add('concluido');
        }

        const artigo = document.createElement('article');

        const info = criarElemento('ul');
        info.append(criarElemento('li', this.duracao + 'h'), criarElemento('li', this.modalidade));

        const acoes = criarElemento('div', null, 'acoes');

        const marcar = criarElemento('button', this.concluido ? 'Desmarcar' : 'Marcar como concluído', 'btn-concluir');
        marcar.type = 'button';
        marcar.addEventListener('click', () => aoMarcar(this));

        const detalhes = criarElemento('a', 'Ver detalhes →');
        detalhes.href = this.link;
        detalhes.target = '_blank';

        const remover = criarElemento('button', 'Remover', 'btn-remover');
        remover.type = 'button';
        remover.addEventListener('click', () => aoRemover(this));

        acoes.append(marcar, detalhes, remover);

        artigo.append(
            criarElemento('p', this.area),
            criarElemento('h2', this.nome),
            criarElemento('p', this.instituicao),
            info,
            criarElemento('p', this.situacao()),
            acoes
        );
        item.append(artigo);
        return item;
    }
}

class Vaga {

    constructor(dados) {
        this.id = dados.id;
        this.titulo = dados.titulo;
        this.empresa = dados.empresa;
        this.area = dados.area;
        this.cidade = dados.cidade;
        this.modalidade = dados.modalidade;
        this.bolsa = Number(dados.bolsa);
        this.link = dados.link_candidatura;
        this.aderencia = dados.aderencia;
        this.falta = dados.falta || [];
    }

    bolsaFormatada() {
        return 'R$ ' + this.bolsa.toFixed(2).replace('.', ',') + '/mês';
    }

    cumpreTudo() {
        return this.falta.length === 0;
    }

    criarCard(aoCandidatar) {
        const card = criarElemento('article', null, 'vaga-card');

        const topo = criarElemento('div', null, 'vaga-topo');
        topo.append(criarElemento('p', this.empresa, 'vaga-empresa'));
        topo.append(criarElemento('p', this.aderencia + '% de aderência', 'vaga-aderencia'));

        const barra = criarElemento('div', null, 'vaga-barra');
        const preenchido = document.createElement('span');
        preenchido.style.width = this.aderencia + '%';
        barra.append(preenchido);

        const info = criarElemento('ul', null, 'vaga-info');
        info.append(
            criarElemento('li', this.cidade),
            criarElemento('li', this.modalidade),
            criarElemento('li', this.bolsaFormatada())
        );

        card.append(topo, criarElemento('h3', this.titulo), barra, info);

        if (this.cumpreTudo()) {
            card.append(criarElemento('p', '✓ Você cumpre todos os requisitos desta vaga!', 'vaga-completa'));
        } else {
            card.append(criarElemento('h4', 'O que falta'));

            const lista = criarElemento('ul', null, 'vaga-falta');
            this.falta.forEach(f => {
                const item = criarElemento('li');
                let texto = f.nome;
                if (f.tipo_requisito === 'desejavel') {
                    texto += ' (desejável)';
                }
                item.append(criarElemento('span', texto));

                // curso que ensina o que falta (leva ao catálogo)
                if (f.curso) {
                    const atalho = criarElemento('a', 'Curso: ' + f.curso);
                    atalho.href = 'cursos.html';
                    item.append(atalho);
                }
                lista.append(item);
            });
            card.append(lista);
        }

        // abre o site da vaga se a pessoa confirmar
        const botao = criarElemento('a', 'Quero me candidatar', 'vaga-botao');
        botao.href = this.link;
        botao.target = '_blank';
        botao.addEventListener('click', (e) => {
            if (!aoCandidatar(this)) {
                e.preventDefault();
            }
        });
        card.append(botao);

        return card;
    }
}
