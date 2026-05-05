const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const canvas = new ChartJSNodeCanvas({ width: 600, height: 400 });

async function gerarGrafico(pergunta, dados, tipo = 'bar') {
    return await canvas.renderToBuffer({
        type: tipo,
        data: {
            labels: Object.keys(dados),
            datasets: [{
                label: 'Respostas',
                data: Object.values(dados)
            }]
        },
        options: {
            plugins: {
                title: { display: true, text: pergunta },
                legend: { display: true }
            }
        }
    });
}

module.exports = gerarGrafico;