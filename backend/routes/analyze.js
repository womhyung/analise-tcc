const express = require('express');
const multer = require('multer');
const PDFDocument = require('pdfkit');

const { isConnected } = require('../config/db');
const Response = require('../models/Response');

const analyzeResponses = require('../services/analyzer');
const gerarGrafico = require('../services/chartGenerator');
const gerarTextoCorrido = require('../services/insights');
const analisarTexto = require('../services/aiAnalysis');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

let dadosMemoria = [];
let textosBase = [];

// 🔍 Detecta perguntas abertas
function ehPerguntaAberta(respostas) {
    const total = Object.values(respostas).reduce((a, b) => a + b, 0);
    const unicas = Object.keys(respostas).length;

    return (unicas / total) > 0.7;
}

// 🔹 CSV parser
function parseCSV(csv) {
    const linhas = csv.trim().split('\n');

    const headers = linhas[0]
        .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
        .map(h => h.replace(/"/g, '').trim());

    return linhas.slice(1).map(l => {
        const valores = l
            .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
            .map(v => v.replace(/"/g, '').trim());

        let obj = {};

        headers.forEach((h, i) => {
            if (h.toLowerCase().includes("carimbo")) return;
            obj[h] = valores[i] || "";
        });

        return { respostas: obj };
    });
}

// 📥 Upload CSV
router.post('/upload', upload.single('file'), async (req, res) => {
    const dados = parseCSV(req.file.buffer.toString());

    if (isConnected()) {
        await Response.insertMany(dados);
        return res.json({ modo: "banco" });
    } else {
        dadosMemoria = dados;
        return res.json({ modo: "memoria" });
    }
});

// 📥 Upload texto base
router.post('/upload/base', upload.single('file'), async (req, res) => {

    const texto = req.file.buffer.toString('utf-8').trim();

    if (texto.length > 50) {
        textosBase.push(texto);
    }

    res.json({ msg: "Texto base enviado" });
});

// 📄 GERAR PDF
router.get('/export/pdf', async (req, res) => {

    let dados = isConnected() ? await Response.find() : dadosMemoria;

    if (!dados.length) {
        return res.send("Nenhum dado disponível.");
    }

    const resultado = analyzeResponses(dados);
    const textoPrincipal = gerarTextoCorrido(resultado);

    const doc = new PDFDocument({ margin: 70 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=relatorio.pdf');

    doc.pipe(res);

    const temReferencial = textosBase.length > 0;

    // =========================
    // CAPA
    // =========================
    doc.fontSize(20).text('RELATÓRIO DE ANÁLISE DE QUESTIONÁRIO', { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(12).text(
        "Relatório gerado automaticamente a partir dos dados coletados por meio de questionário aplicado.",
        { align: 'center' }
    );

    doc.addPage();

    // =========================
    // INTRODUÇÃO
    // =========================
    doc.fontSize(16).text('1. INTRODUÇÃO', { underline: true });
    doc.moveDown();

    let intro = "Este relatório apresenta a análise dos dados obtidos por meio da aplicação de um questionário, com o objetivo de compreender o uso de tecnologias educacionais no contexto escolar.";

    if (temReferencial) {
        intro += " A análise está fundamentada em estudos teóricos que discutem a integração da tecnologia no processo de ensino e aprendizagem.";
    }

    doc.fontSize(12).text(intro, { align: 'justify' });

    doc.moveDown();

    // =========================
    // RESULTADOS
    // =========================
    doc.fontSize(16).text('2. RESULTADOS E DISCUSSÃO', { underline: true });
    doc.moveDown();

    doc.fontSize(12).text(textoPrincipal, { align: 'justify' });

    // 🔥 Referencial integrado
    if (temReferencial) {
        doc.moveDown();

        textosBase.forEach((t, i) => {
            doc.fontSize(10).text(
                `Segundo o referencial teórico (${i + 1}), ${t.substring(0, 200)}...`,
                { align: 'justify' }
            );
            doc.moveDown();
        });
    }

    // =========================
    // ANÁLISE POR PERGUNTA
    // =========================
    let contador = 1;

    for (let p in resultado) {

        doc.addPage();

        doc.fontSize(14).text(`2.${contador} ${p}`, { underline: true });
        doc.moveDown();

        let r = resultado[p];
        const aberta = ehPerguntaAberta(r);

        if (!aberta) {
            // 📊 PERGUNTA FECHADA

            let total = Object.values(r).reduce((a, b) => a + b, 0);
            let ordenado = Object.entries(r).sort((a, b) => b[1] - a[1]);

            let principal = ordenado[0];
            let porcentagem = ((principal[1] / total) * 100).toFixed(1);

            let img = await gerarGrafico(p, r, 'pie');
            doc.image(img, { width: 450, align: 'center' });

            doc.moveDown();

            let textoAnalise = `Observa-se que a alternativa mais selecionada foi "${principal[0]}", representando ${porcentagem}% dos participantes, indicando uma tendência predominante entre os respondentes.`;

            if (temReferencial) {
                textoAnalise += " Esse resultado está em consonância com estudos sobre o uso de tecnologias educacionais no ambiente escolar.";
            }

            doc.fontSize(12).text(textoAnalise, { align: 'justify' });

            doc.moveDown();

            doc.fontSize(11).text('Distribuição das respostas:', { underline: true });
            doc.moveDown(0.5);

            ordenado.forEach(([resp, qtd]) => {
                let perc = ((qtd / total) * 100).toFixed(1);
                doc.text(`• ${resp}: ${qtd} (${perc}%)`);
            });

        } else {
            // 🧠 PERGUNTA ABERTA

            const respostasTexto = Object.keys(r);
            const analise = analisarTexto(respostasTexto);

            let textoAberto = analise.resumo;

            if (temReferencial) {
                textoAberto += " Essa interpretação pode ser relacionada com estudos que abordam práticas pedagógicas mediadas por tecnologia.";
            }

            doc.fontSize(12).text(textoAberto, { align: 'justify' });

            doc.moveDown();

            if (analise.exemplos) {
                doc.fontSize(11).text("Exemplos de respostas:", { underline: true });
                doc.moveDown(0.5);
                doc.text(analise.exemplos);
            }
        }

        contador++;
    }

    // =========================
    // CONCLUSÃO
    // =========================
    let abertas = dados.map(d => Object.values(d.respostas)).flat();
    let ia = analisarTexto(abertas);

    doc.addPage();

    doc.fontSize(16).text('3. CONSIDERAÇÕES FINAIS', { underline: true });
    doc.moveDown();

    let conclusao = ia.resumo;

    if (temReferencial) {
        conclusao += " Os resultados dialogam com a literatura da área, reforçando a importância do uso das tecnologias educacionais no processo de ensino e aprendizagem.";
    }

    doc.fontSize(12).text(conclusao, { align: 'justify' });

    doc.end();
});

module.exports = router;