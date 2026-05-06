const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const width = 800;
const height = 500;

const canvas = new ChartJSNodeCanvas({ width, height });

// 🎨 Paleta moderna
const cores = [
    '#6C5CE7', '#00B894', '#0984E3',
    '#FD79A8', '#FDCB6E', '#E17055',
    '#00CEC9', '#A29BFE'
];

// 🔥 corta texto grande
function reduzirTexto(texto, limite = 28) {
    return texto.length > limite
        ? texto.substring(0, limite) + '...'
        : texto;
}

// 🔥 ordena + pega TOP respostas
function prepararDados(dados, limite = 6) {

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

    const dadosFiltrados = prepararDados(dados);

    const total = Object.values(dadosFiltrados)
        .reduce((a, b) => a + b, 0);

    const labels = Object.keys(dadosFiltrados).map(l => reduzirTexto(l));
    const valores = Object.values(dadosFiltrados);

    const porcentagens = valores.map(v =>
        ((v / total) * 100).toFixed(1) + '%'
    );

    // 🎯 destaque da maior resposta
    const maxIndex = valores.indexOf(Math.max(...valores));

    const coresAjustadas = valores.map((_, i) =>
        i === maxIndex ? '#00B894' : cores[i % cores.length]
    );

    const config = {
        type: tipo === 'line' ? 'line' : tipo === 'bar' ? 'bar' : 'pie',

        data: {
            labels: labels,
            datasets: [{
                label: 'Respostas',
                data: valores,
                backgroundColor: tipo === 'line' ? '#6C5CE7' : coresAjustadas,
                borderColor: '#222',
                borderWidth: 1,
                fill: tipo === 'line' ? false : true,
                tension: 0.3
            }]
        },

        options: {
            responsive: false,

            plugins: {
                title: {
                    display: true,
                    text: pergunta,
                    font: { size: 16 }
                },

                legend: {
                    display: true,
                    position: 'bottom'
                },

                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let i = context.dataIndex;
                            return `${valores[i]} respostas (${porcentagens[i]})`;
                        }
                    }
                }
            },

            scales: tipo === 'line' || tipo === 'bar' ? {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0 }
                }
            } : {}
        }
    };

    return await canvas.renderToBuffer(config);
}

module.exports = gerarGrafico;