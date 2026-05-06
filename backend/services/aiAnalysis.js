function analisarTexto(lista) {

    if (!lista || lista.length === 0) {
        return { resumo: "Não houve respostas suficientes para análise." };
    }

    const respostas = lista.filter(r => r && r.length > 3);

    const exemplos = respostas.slice(0, 3);

    const palavras = respostas.join(' ')
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/);

    let freq = {};

    palavras.forEach(p => {
        if (p.length > 4) {
            freq[p] = (freq[p] || 0) + 1;
        }
    });

    const top = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(p => p[0]);

    let resumo = `A análise das respostas abertas evidencia que os participantes apresentam diferentes percepções sobre o tema abordado. `;

    if (top.length > 0) {
        resumo += `Os termos mais recorrentes foram: ${top.join(', ')}, indicando os principais focos das respostas. `;
    }

    resumo += `Observa-se que não há uma única definição dominante, o que sugere diversidade de entendimento entre os respondentes.`;

    return {
        resumo,
        exemplos: exemplos.length > 0
            ? "• " + exemplos.join('\n• ')
            : null
    };
}

module.exports = analisarTexto;