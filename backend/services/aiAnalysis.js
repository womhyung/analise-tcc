function analisarTexto(lista) {

    const respostas = lista
        .filter(r => r && r.length > 5)
        .map(r => r.toLowerCase());

    const temas = {
        tecnologiaFisica: ['computador', 'notebook', 'projetor', 'datashow', 'tv', 'celular'],
        tecnologiaDigital: ['google', 'plataforma', 'online', 'internet', 'aplicativo'],
        metodologia: ['dinamica', 'interativa', 'participacao', 'engajamento'],
        dificuldade: ['falta', 'dificuldade', 'problema', 'ausencia'],
        ensino: ['ensino', 'aprendizagem', 'aluno', 'aula']
    };

    let contagem = {};
    let exemplos = {};

    // inicializa
    for (let tema in temas) {
        contagem[tema] = 0;
        exemplos[tema] = [];
    }

    // 🔍 ANALISA CADA RESPOSTA INDIVIDUALMENTE
    respostas.forEach(resposta => {

        for (let tema in temas) {

            if (temas[tema].some(p => resposta.includes(p))) {

                contagem[tema]++;

                // guarda exemplo (máx 2 por tema)
                if (exemplos[tema].length < 2) {
                    exemplos[tema].push(resposta);
                }

                break; // evita contar a mesma resposta em vários temas
            }
        }
    });

    const total = respostas.length;

    // 🎯 função auxiliar
    function porcentagem(valor) {
        return total > 0 ? ((valor / total) * 100).toFixed(1) : 0;
    }

    // 🧠 TEXTO ACADÊMICO MELHORADO
    let texto = "A análise das respostas abertas permite identificar padrões relevantes nas percepções dos participantes acerca do uso das tecnologias educacionais.\n\n";

    if (contagem.tecnologiaFisica > 0) {
        texto += `Observa-se que ${porcentagem(contagem.tecnologiaFisica)}% dos respondentes associam as tecnologias a recursos físicos, como computadores, projetores e dispositivos móveis, evidenciando uma compreensão mais tradicional do conceito. `;
    }

    if (contagem.tecnologiaDigital > 0) {
        texto += `Por outro lado, ${porcentagem(contagem.tecnologiaDigital)}% destacam o uso de ferramentas digitais e plataformas online, indicando uma ampliação do entendimento para ambientes virtuais de aprendizagem. `;
    }

    if (contagem.metodologia > 0) {
        texto += `Além disso, ${porcentagem(contagem.metodologia)}% das respostas evidenciam a utilização das tecnologias como estratégia metodológica, favorecendo aulas mais dinâmicas, interativas e participativas. `;
    }

    if (contagem.dificuldade > 0) {
        texto += `Entretanto, ${porcentagem(contagem.dificuldade)}% dos participantes apontam dificuldades, principalmente relacionadas à falta de infraestrutura ou suporte técnico adequado. `;
    }

    texto += "\n\nDe modo geral, os dados indicam que o uso das tecnologias educacionais contribui significativamente para a melhoria do processo de ensino e aprendizagem, promovendo maior engajamento dos alunos e inovação nas práticas pedagógicas.";

    // 🧾 exemplos reais (diferencial forte pra TCC)
    let exemplosTexto = "\n\nExemplos de respostas dos participantes:\n";

    for (let tema in exemplos) {
        exemplos[tema].forEach(e => {
            exemplosTexto += `- "${e}"\n`;
        });
    }

    return {
        resumo: texto,
        exemplos: exemplosTexto,
        temas: contagem
    };
}

module.exports = analisarTexto;