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

// 📥 Upload base (PDF/DOC/TXT)
router.post('/upload/base', upload.single('file'), async (req, res) => {
    textosBase.push(req.file.buffer.toString());
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

    // =========================
    // 1. CAPA
    // =========================
    doc.fontSize(20).text('RELATÓRIO DE ANÁLISE DE QUESTIONÁRIO', { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(12).text(
        "Relatório gerado automaticamente a partir dos dados coletados por meio de questionário aplicado.",
        { align: 'center' }
    );

    doc.addPage();

    // =========================
    // 2. INTRODUÇÃO
    // =========================
    doc.fontSize(16).text('1. INTRODUÇÃO', { underline: true });
    doc.moveDown();

    doc.fontSize(12).text(
        "Este relatório tem como objetivo apresentar a análise dos dados obtidos por meio da aplicação de um questionário, visando compreender o uso de tecnologias educacionais no contexto escolar.",
        { align: 'justify' }
    );

    doc.moveDown();

    // =========================
    // 3. RESULTADOS E DISCUSSÃO
    // =========================
    doc.fontSize(16).text('2. RESULTADOS E DISCUSSÃO', { underline: true });
    doc.moveDown();

    doc.fontSize(12).text(texto, { align: 'justify' });

    // =========================
    // 4. ANÁLISE POR PERGUNTA
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

            let img = await gerarGrafico(p, r, 'pie');
            doc.image(img, { width: 450, align: 'center' });

            doc.moveDown();

            img = await gerarGrafico(p, r, 'line');
            doc.image(img, { width: 450, align: 'center' });

            doc.moveDown();

            doc.fontSize(11).text('Distribuição das respostas:', { underline: true });
            doc.moveDown(0.5);

            for (let x in r) {
                doc.text(`• ${x}: ${r[x]} respostas`);
            }

        } else {
            // 🧠 PERGUNTA ABERTA

            doc.fontSize(12).text(
                "Esta questão apresenta respostas abertas, caracterizadas pela diversidade de opiniões dos participantes.",
                { align: 'justify' }
            );

            doc.moveDown();

            const respostasTexto = Object.keys(r);

            const analise = analisarTexto(respostasTexto);

            doc.text(analise.resumo, { align: 'justify' });
        }

        contador++;
    }

    // =========================
    // 5. REFERENCIAL TEÓRICO
    // =========================
    if (textosBase.length > 0) {
        doc.addPage();

        doc.fontSize(16).text('3. REFERENCIAL TEÓRICO', { underline: true });
        doc.moveDown();

        textosBase.forEach(t => {
            doc.fontSize(12).text(t, { align: 'justify' });
            doc.moveDown();
        });
    }

    // =========================
    // 6. ANÁLISE GERAL DAS RESPOSTAS ABERTAS
    // =========================
    let abertas = dados.map(d => Object.values(d.respostas)).flat();

    let ia = analisarTexto(abertas);

    doc.addPage();

    doc.fontSize(16).text('4. ANÁLISE DAS RESPOSTAS ABERTAS', { underline: true });
    doc.moveDown();

    doc.fontSize(12).text(ia.resumo, { align: 'justify' });

    doc.end();
});

module.exports = router;