function analisarTexto(lista) {

    const texto = lista.join(' ').toLowerCase();

    // 🎯 TEMAS (você pode expandir depois)
    const temas = {
        tecnologiaFisica: ['computador', 'notebook', 'projetor', 'datashow', 'tv'],
        tecnologiaDigital: ['google', 'plataforma', 'online', 'internet', 'aplicativo'],
        metodologia: ['dinamica', 'interativa', 'participacao', 'engajamento'],
        dificuldade: ['falta', 'dificuldade', 'problema', 'ausencia'],
        ensino: ['ensino', 'aprendizagem', 'aluno', 'aula']
    };

    let contagem = {};

    for (let tema in temas) {
        contagem[tema] = 0;

        temas[tema].forEach(palavra => {
            if (texto.includes(palavra)) {
                contagem[tema]++;
            }
        });
    }

    // 🎯 gerar interpretação
    let partes = [];

    if (contagem.tecnologiaFisica > 0) {
        partes.push("os participantes associam frequentemente as tecnologias a recursos físicos utilizados em sala de aula");
    }

    if (contagem.tecnologiaDigital > 0) {
        partes.push("também foi possível observar a presença de ferramentas digitais e plataformas online como parte desse contexto");
    }

    if (contagem.metodologia > 0) {
        partes.push("destaca-se ainda a importância do uso dessas tecnologias para promover aulas mais dinâmicas e interativas");
    }

    if (contagem.dificuldade > 0) {
        partes.push("por outro lado, foram identificadas dificuldades relacionadas à falta de recursos ou suporte adequado");
    }

    // 🧠 TEXTO FINAL (estilo TCC)
    let resumo = "A análise das respostas abertas evidencia que ";

    if (partes.length > 0) {
        resumo += partes.join(", ") + ". ";
    } else {
        resumo += "há uma diversidade de percepções entre os participantes. ";
    }

    resumo += "De modo geral, observa-se que o uso das tecnologias educacionais está diretamente relacionado à melhoria do processo de ensino e aprendizagem, contribuindo para maior participação dos alunos e dinamização das práticas pedagógicas.";

    return {
        resumo,
        temas: contagem
    };
}

module.exports = analisarTexto;