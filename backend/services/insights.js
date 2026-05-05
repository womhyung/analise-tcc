function gerarTextoCorrido(resultado) {
    let texto = "Este relatório apresenta a análise das respostas obtidas por meio do questionário aplicado.\n\n";

    for (let pergunta in resultado) {
        let respostas = resultado[pergunta];

        let total = Object.values(respostas).reduce((a, b) => a + b, 0);

        let maisFrequente = Object.entries(respostas)
            .sort((a, b) => b[1] - a[1])[0];

        if (!maisFrequente) continue;

        let porcentagem = ((maisFrequente[1] / total) * 100).toFixed(1);

        texto += `Na questão "${pergunta}", observou-se que a resposta mais frequente foi "${maisFrequente[0]}", representando ${porcentagem}% dos participantes. `;

        texto += "As demais respostas apresentaram menor frequência, indicando diversidade de opiniões.\n\n";
    }

    return texto;
}

module.exports = gerarTextoCorrido;