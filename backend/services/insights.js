function gerarTextoCorrido(resultado) {

    let texto = "A partir da análise dos dados coletados por meio do questionário aplicado, foi possível identificar tendências relevantes relacionadas ao uso de tecnologias educacionais no contexto escolar.\n\n";

    let totalPerguntas = 0;
    let tendenciaFisica = 0;
    let tendenciaDigital = 0;
    let tendenciaParticipacao = 0;

    let resumoPerguntas = [];

    for (let pergunta in resultado) {

        let respostas = resultado[pergunta];

        let total = Object.values(respostas).reduce((a, b) => a + b, 0);

        let ordenado = Object.entries(respostas)
            .sort((a, b) => b[1] - a[1]);

        if (!ordenado.length) continue;

        totalPerguntas++;

        let principal = ordenado[0][0];
        let quantidade = ordenado[0][1];

        let porcentagem = ((quantidade / total) * 100).toFixed(1);

        resumoPerguntas.push(
            `na questão "${pergunta}", a resposta mais recorrente foi "${principal}", representando ${porcentagem}% dos participantes`
        );

        let textoLower = principal.toLowerCase();

        // 🧠 interpretação por padrão
        if (textoLower.includes("computador") || textoLower.includes("projetor") || textoLower.includes("notebook")) {
            tendenciaFisica++;
        }

        if (textoLower.includes("google") || textoLower.includes("plataforma") || textoLower.includes("online") || textoLower.includes("internet")) {
            tendenciaDigital++;
        }

        if (textoLower.includes("interação") || textoLower.includes("participação") || textoLower.includes("dinâmica")) {
            tendenciaParticipacao++;
        }
    }

    // 🔥 PARÁGRAFO 1 (dados reais)
    if (resumoPerguntas.length > 0) {
        texto += "De forma geral, observa-se que ";

        texto += resumoPerguntas.slice(0, 3).join(", ") + ". ";

        if (resumoPerguntas.length > 3) {
            texto += "As demais questões seguiram padrões semelhantes, evidenciando consistência nas respostas obtidas.\n\n";
        } else {
            texto += "\n\n";
        }
    }

    // 🔥 PARÁGRAFO 2 (interpretação)
    texto += "No que se refere à interpretação dos dados, identifica-se que ";

    let interpretacoes = [];

    if (tendenciaFisica > 0) {
        interpretacoes.push("há uma forte associação entre tecnologias educacionais e recursos físicos utilizados em sala de aula");
    }

    if (tendenciaDigital > 0) {
        interpretacoes.push("também se destaca a presença de tecnologias digitais e ambientes virtuais como parte do processo de ensino");
    }

    if (tendenciaParticipacao > 0) {
        interpretacoes.push("o uso dessas tecnologias está diretamente relacionado ao aumento da participação e do engajamento dos alunos");
    }

    if (interpretacoes.length > 0) {
        texto += interpretacoes.join(", ") + ". ";
    } else {
        texto += "existe uma diversidade de percepções entre os participantes. ";
    }

    texto += "\n\n";

    // 🔥 PARÁGRAFO 3 (conclusão acadêmica)
    texto += "Dessa forma, os resultados indicam que a integração de tecnologias no ambiente educacional contribui significativamente para a modernização das práticas pedagógicas, promovendo aulas mais dinâmicas, interativas e alinhadas às demandas contemporâneas da educação.";

    return texto;
}

module.exports = gerarTextoCorrido;