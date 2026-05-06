const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const width = 800;
const height = 500;

const canvas = new ChartJSNodeCanvas({
    width,
    height,
    backgroundColour: 'white' // 🔥 resolve gráfico preto
});

// 🎨 Paleta moderna
const cores = [
    '#6C5CE7', '#00B894', '#0984E3',
    '#FD79A8', '#FDCB6E', '#E17055',
    '#00CEC9', '#A29BFE'
];

// 🔥 reduz texto longo
function reduzirTexto(texto, limite = 30) {
    return texto.length > limite
        ? texto.substring(0, limite) + '...'
        : texto;
}

// 🔥 pega TOP respostas
function topRespostas(dados, limite = 6) {
    let ordenado = Object.entries(dados)
        .sort((a, b) => b[1] - a[1]);

    let top = ordenado.slice(0, limite);
    let outros = ordenado.slice(limite);

    let resultado = Object.fromEntries(top);

    if (outros.length > 0) {
        let soma = outros.reduce((acc, cur) => acc + cur[1], 0);
        resultado["Outros"] = soma;
    }

    return resultado;
}

async function gerarGrafico(pergunta, dados, tipo = 'pie') {

    const dadosFiltrados = topRespostas(dados);

    const labels = Object.keys(dadosFiltrados).map(l => reduzirTexto(l));
    const valores = Object.values(dadosFiltrados);

    const config = {
        type: tipo,

        data: {
            labels,
            datasets: [{
                label: 'Respostas',
                data: valores,
                backgroundColor: labels.map((_, i) => cores[i % cores.length]),
                borderColor: '#ffffff',
                borderWidth: 2
            }]
        },

        options: {
            responsive: false,

            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: '#000'
                    }
                },
                title: {
                    display: true,
                    text: pergunta,
                    color: '#000'
                }
            },

            scales: tipo !== 'pie' ? {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#000' }
                },
                x: {
                    ticks: { color: '#000' }
                }
            } : {}
        }
    };

    return await canvas.renderToBuffer(config);
}

module.exports = gerarGrafico;