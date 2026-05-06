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

// 📥 Upload base
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
    const texto = gerarTextoCorrido(resultado);

    const doc = new PDFDocument({ margin: 70 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=relatorio.pdf');

    doc.pipe(res);

    // CAPA
    doc.fontSize(20).text('RELATÓRIO DE ANÁLISE DE QUESTIONÁRIO', { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(12).text(
        "Relatório gerado automaticamente a partir dos dados coletados.",
        { align: 'center' }
    );

    doc.addPage();

    // INTRODUÇÃO
    doc.fontSize(16).text('1. INTRODUÇÃO', { underline: true });
    doc.moveDown();

    doc.fontSize(12).text(
        "Este relatório apresenta a análise dos dados obtidos por meio de questionário.",
        { align: 'justify' }
    );

    doc.moveDown();

    // RESULTADOS
    doc.fontSize(16).text('2. RESULTADOS E DISCUSSÃO', { underline: true });
    doc.moveDown();

    doc.fontSize(12).text(texto, { align: 'justify' });

    // 🔥 REFERENCIAL INTEGRADO
    if (textosBase.length > 0) {
        doc.moveDown();

        doc.text("De acordo com estudos teóricos:", { align: 'justify' });

        textosBase.forEach((t, i) => {
            doc.text(`(${i + 1}) ${t}`, { align: 'justify' });
            doc.moveDown();
        });
    }

    // ANÁLISE POR PERGUNTA
    let contador = 1;

    for (let p in resultado) {

        doc.addPage();

        doc.fontSize(14).text(`2.${contador} ${p}`, { underline: true });
        doc.moveDown();

        let r = resultado[p];
        const aberta = ehPerguntaAberta(r);

        if (!aberta) {
            let total = Object.values(r).reduce((a, b) => a + b, 0);
            let ordenado = Object.entries(r).sort((a, b) => b[1] - a[1]);

            let principal = ordenado[0];
            let porcentagem = ((principal[1] / total) * 100).toFixed(1);

            let img = await gerarGrafico(p, r, 'pie');
            doc.image(img, { width: 450, align: 'center' });

            doc.moveDown();

            doc.text(
                `A alternativa mais escolhida foi "${principal[0]}" (${porcentagem}%).`,
                { align: 'justify' }
            );

        } else {
            const respostasTexto = Object.keys(r);
            const analise = analisarTexto(respostasTexto);

            doc.text(analise.resumo, { align: 'justify' });

            if (analise.exemplos) {
                doc.moveDown();
                doc.text("Exemplos:", { underline: true });
                doc.text(analise.exemplos);
            }
        }

        contador++;
    }

    doc.end();
});

module.exports = router;