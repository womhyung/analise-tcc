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

// ✅ FUNÇÃO QUE ESTAVA FALTANDO
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

// detectar aberta
function ehPerguntaAberta(respostas) {
    const total = Object.values(respostas).reduce((a, b) => a + b, 0);
    const unicas = Object.keys(respostas).length;
    return (unicas / total) > 0.7;
}

// 📊 Upload CSV (AGORA SEGURO)
router.post('/upload', upload.single('file'), async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({ erro: "Arquivo não enviado" });
        }

        const csv = req.file.buffer.toString('utf-8');

        const dados = parseCSV(csv);

        if (!dados.length) {
            return res.status(400).json({ erro: "CSV vazio ou inválido" });
        }

        if (isConnected()) {
            await Response.insertMany(dados);
            return res.json({ modo: "banco" });
        } else {
            dadosMemoria = dados;
            return res.json({ modo: "memoria" });
        }

    } catch (err) {
        console.error("🔥 ERRO UPLOAD:", err);
        res.status(500).json({ erro: "Erro interno no servidor" });
    }
});

// 📚 Upload base
router.post('/upload/base', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ erro: "Arquivo não enviado" });
        }

        const texto = req.file.buffer.toString('utf-8').trim();

        if (texto.length > 50) {
            textosBase.push(texto);
        }

        res.json({ msg: "Texto base enviado" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: "Erro no upload base" });
    }
});

// 📄 PDF
router.get('/export/pdf', async (req, res) => {
    try {

        let dados = isConnected() ? await Response.find() : dadosMemoria;

        if (!dados.length) {
            return res.status(400).send("Sem dados");
        }

        const resultado = analyzeResponses(dados);
        const texto = gerarTextoCorrido(resultado);

        const doc = new PDFDocument({ margin: 70 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=relatorio.pdf');

        doc.pipe(res);

        doc.fontSize(20).text('RELATÓRIO DE ANÁLISE', { align: 'center' });
        doc.addPage();

        doc.fontSize(12).text(texto, { align: 'justify' });

        for (let p in resultado) {

            doc.addPage();
            doc.fontSize(14).text(p);

            let r = resultado[p];

            if (!ehPerguntaAberta(r)) {

                let img = await gerarGrafico(p, r, 'pie');
                doc.image(img, { width: 450 });

            } else {

                const analise = analisarTexto(Object.keys(r));
                doc.text(analise.resumo);
            }
        }

        doc.end();

    } catch (err) {
        console.error("🔥 ERRO PDF:", err);
        res.status(500).send("Erro ao gerar PDF");
    }
});

module.exports = router;