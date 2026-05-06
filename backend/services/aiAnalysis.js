function analisarTexto(lista) {

    if (!lista || lista.length === 0) {
        return { resumo: "Não houve respostas suficientes para análise." };
    }

    const respostas = lista.filter(r => r && r.length > 3);

    const exemplosLista = respostas.slice(0, 3);

    const texto = respostas.join(' ').toLowerCase();

    let ideias = [];

    if (texto.includes("tecnologia")) {
        ideias.push("os participantes apresentam diferentes compreensões sobre o conceito de tecnologia");
    }

    if (texto.includes("computador") || texto.includes("projetor")) {
        ideias.push("há forte associação com recursos físicos utilizados em sala de aula");
    }

    if (texto.includes("internet") || texto.includes("online")) {
        ideias.push("também foram identificadas menções a tecnologias digitais e ambientes virtuais");
    }

    if (texto.includes("aluno") || texto.includes("participação")) {
        ideias.push("as respostas indicam relação com o aumento da participação dos alunos");
    }

    let resumo = "A análise das respostas abertas demonstra que ";

    if (ideias.length > 0) {
        resumo += ideias.join(", ") + ". ";
    } else {
        resumo += "existe uma diversidade de opiniões entre os participantes. ";
    }

    resumo += "Observa-se que não há uma única definição dominante, indicando múltiplas interpretações sobre o tema abordado.";

    return {
        resumo,
        exemplos: exemplosLista.length > 0
            ? "• " + exemplosLista.join('\n• ')
            : null
    };
}

module.exports = analisarTexto;