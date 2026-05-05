function gerarInsights(resultado) {
    let textos = [];

    for (let p in resultado) {
        const respostas = resultado[p];
        const total = Object.values(respostas).reduce((a, b) => a + b, 0);

        let max = 0, dom = "";

        for (let r in respostas) {
            if (respostas[r] > max) {
                max = respostas[r];
                dom = r;
            }
        }

        let perc = ((max / total) * 100).toFixed(1);

        textos.push(
            `Na questão "${p}", ${perc}% dos participantes escolheram "${dom}", indicando forte tendência.`
        );
    }

    return textos;
}

module.exports = gerarInsights;