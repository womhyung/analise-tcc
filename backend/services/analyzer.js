function analyzeResponses(dados) {
    let resultado = {};

    dados.forEach(item => {
        for (let pergunta in item.respostas) {
            if (!resultado[pergunta]) resultado[pergunta] = {};

            let r = item.respostas[pergunta];
            resultado[pergunta][r] = (resultado[pergunta][r] || 0) + 1;
        }
    });

    return resultado;
}

module.exports = analyzeResponses;