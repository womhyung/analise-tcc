const express = require('express');
const multer = require('multer');
const PDFDocument = require('pdfkit');

const { isConnected } = require('../config/db');
const Response = require('../models/Response');

const analyzeResponses = require('../services/analyzer');
const gerarGrafico = require('../services/chartGenerator');
const gerarTextoCorrido = require('../services/insights'); // 🔥 atualizado
const analisarTexto = require('../services/aiAnalysis');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// 🔥 memória fallback
let dadosMemoria = [];

// ✅ PARSER CSV MELHORADO
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
            if (h.toLowerCase().includes("carimbo")) return; // ❌ remove timestamp
            obj[h] = valores[i] || "";
        });

        return { respostas: obj };
    });
}

// 📥 Upload
router.post('/upload', upload.single('file'), async (req, res) => {
    const dados = parseCSV(req.file.buffer.toString());

    if (isConnected()) {
        await Response.insertMany(dados);
        return res.json({ modo: "banco", msg: "Dados salvos no MongoDB" });
    } else {
        dadosMemoria = dados;
        return res.json({ modo: "memoria", msg: "Dados armazenados temporariamente" });
    }
});

// 📄 PDF
router.get('/export/pdf', async (req, res) => {
    let dados;

    if (isConnected()) {
        dados = await Response.find();
    } else {
        dados = dadosMemoria;
    }

    const resultado = analyzeResponses(dados);

    const doc = new PDFDocument({ margin: 70 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=relatorio.pdf');

    doc.pipe(res);

    // 🧾 TÍTULO
    doc.fontSize(18).text('RELATÓRIO DE ANÁLISE DE QUESTIONÁRIO', {
        align: 'center'
    });

    doc.moveDown();

    // 🧠 TEXTO CORRIDO (ANTES DOS GRÁFICOS)
    const texto = gerarTextoCorrido(resultado);

    doc.fontSize(12).text(texto, {
        align: 'justify'
    });

    // 📊 GRÁFICOS POR PERGUNTA
    for (let p in resultado) {
        doc.addPage();

        doc.fontSize(14).text(`Pergunta: ${p}`, { underline: true });

        doc.moveDown();

        let r = resultado[p];

        // 📊 gráfico pizza
        let img = await gerarGrafico(p, r, 'pie');
        doc.image(img, { width: 400 });

        doc.moveDown();

        // 📈 gráfico linha
        img = await gerarGrafico(p, r, 'line');
        doc.image(img, { width: 400 });

        doc.moveDown();

        // 📋 respostas organizadas
        for (let x in r) {
            doc.text(`• ${x}: ${r[x]} respostas`);
        }
    }

    // 🧠 ANÁLISE DE TEXTO (RESPOSTAS ABERTAS)
    let abertas = dados.map(d => Object.values(d.respostas)).flat();

    let ia = analisarTexto(abertas);

    doc.addPage();
    doc.fontSize(14).text('Análise de Respostas Abertas', { underline: true });

    doc.moveDown();
    doc.fontSize(12).text(ia.resumo, {
        align: 'justify'
    });

    doc.end();
});

module.exports = router;