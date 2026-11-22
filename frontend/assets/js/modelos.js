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
        this.descricao = dados.descricao;
        this.beneficios = dados.beneficios;
        this.quantidade = dados.quantidade;
        this.dataLimite = dados.data_limite;
        this.aderencia = dados.aderencia;
        this.falta = dados.falta || [];
    }

    // a empresa pode informar um site ou um e-mail para a candidatura
    candidaturaPorEmail() {
        return this.link && this.link.includes('@') && !this.link.startsWith('http');
    }

    linkCandidatura() {
        return this.candidaturaPorEmail() ? 'mailto:' + this.link : this.link;
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

        if (this.descricao) {
            card.append(criarElemento('p', this.descricao, 'vaga-descricao'));
        }
        if (this.beneficios) {
            card.append(criarElemento('p', 'Benefícios: ' + this.beneficios, 'vaga-descricao'));
        }
        if (this.quantidade > 1) {
            card.append(criarElemento('p', this.quantidade + ' vagas abertas', 'vaga-descricao'));
        }
        if (this.dataLimite) {
            card.append(criarElemento('p', 'Inscrições até ' + formatarData(this.dataLimite), 'vaga-prazo'));
        }

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

        // abre o site (ou o e-mail) da vaga se a pessoa confirmar
        const botao = criarElemento('a', 'Quero me candidatar', 'vaga-botao');
        botao.href = this.linkCandidatura();
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

// Telas da empresa e do administrador

// Item com título, detalhes, situação e botões (base das listas de gestão)
class ItemGestao {

    constructor(dados) {
        this.id = dados.id;
        this.status = dados.status;
    }

    // texto da etiqueta de situação (as classes filhas sobrescrevem)
    situacaoTexto() {
        return this.status;
    }

    titulo() {
        return '';
    }

    detalhes() {
        return [];
    }

    // acoes: [{ texto, classe, aoClicar }] ou [{ texto, link }]
    criarItem(acoes) {
        const item = criarElemento('li', null, 'item-gestao');

        const info = criarElemento('div', null, 'item-info');
        const titulo = criarElemento('h3', this.titulo());
        titulo.append(criarElemento('span', this.situacaoTexto(), 'situacao ' + this.status));
        info.append(titulo);
        this.detalhes().forEach(texto => info.append(criarElemento('p', texto)));

        const botoes = criarElemento('div', null, 'item-acoes');
        acoes.forEach(acao => {
            let botao;
            if (acao.link) {
                botao = criarElemento('a', acao.texto);
                botao.href = acao.link;
            } else {
                botao = criarElemento('button', acao.texto, acao.classe);
                botao.type = 'button';
                botao.addEventListener('click', () => acao.aoClicar(this));
            }
            botoes.append(botao);
        });

        item.append(info, botoes);
        return item;
    }
}

class VagaGestao extends ItemGestao {

    constructor(dados) {
        super(dados);
        this.tituloVaga = dados.titulo;
        this.empresa = dados.empresa;
        this.area = dados.area;
        this.bolsa = dados.bolsa;
        this.quantidade = dados.quantidade;
        this.requisitos = dados.requisitos;
        this.dataLimite = dados.data_limite;
        this.atualizada = dados.data_verificacao;
        this.descricao = dados.descricao;
        this.listaRequisitos = dados.lista_requisitos;
        this.candidatura = dados.link_candidatura;
    }

    situacaoTexto() {
        const textos = {
            pendente: 'Aguardando aprovação',
            ativo: 'Publicada',
            inativo: 'Encerrada',
            recusada: 'Recusada'
        };
        return textos[this.status] || this.status;
    }

    titulo() {
        return this.tituloVaga;
    }

    detalhes() {
        let linha = this.empresa + ' · ' + this.area + ' · ' + this.quantidade + ' vaga(s) · ' +
            this.requisitos + ' requisito(s)';
        if (this.bolsa) {
            linha += ' · R$ ' + Number(this.bolsa).toFixed(2).replace('.', ',');
        }

        const linhas = [linha];

        // o administrador precisa ver o conteúdo da vaga antes de aprovar
        if (this.descricao) {
            linhas.push(this.descricao);
        }
        if (this.listaRequisitos) {
            linhas.push('Requisitos: ' + this.listaRequisitos);
        }
        if (this.candidatura) {
            linhas.push('Candidatura: ' + this.candidatura);
        }

        let datas = 'Atualizada em ' + formatarData(this.atualizada);
        if (this.dataLimite) {
            datas += ' · inscrições até ' + formatarData(this.dataLimite);
        }
        linhas.push(datas);
        return linhas;
    }
}

class CursoGestao extends ItemGestao {

    constructor(dados) {
        super(dados);
        this.nome = dados.nome;
        this.instituicao = dados.instituicao;
        this.area = dados.area;
        this.duracao = dados.duracao;
        this.modalidade = dados.modalidade;
        this.competencias = dados.competencias || 'nenhuma';
    }

    situacaoTexto() {
        return this.status === 'ativo' ? 'Ativo' : 'Inativo';
    }

    titulo() {
        return this.nome;
    }

    detalhes() {
        return [
            this.instituicao + ' · ' + this.area + ' · ' + this.duracao + 'h · ' + this.modalidade,
            'Ensina: ' + this.competencias
        ];
    }
}
