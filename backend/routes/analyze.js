const express = require('express');
const multer = require('multer');
const PDFDocument = require('pdfkit');

const { isConnected } = require('../config/db');
const Response = require('../models/Response');

const analyzeResponses = require('../services/analyzer');
const gerarGrafico = require('../services/chartGenerator');
const gerarInsights = require('../services/insights');
const analisarTexto = require('../services/aiAnalysis');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// 🔥 memória fallback
let dadosMemoria = [];

function parseCSV(csv) {
    const linhas = csv.trim().split('\n');
    const headers = linhas[0].split(',');

    return linhas.slice(1).map(l => {
        const v = l.split(',');
        let obj = {};
        headers.forEach((h,i)=> obj[h]=v[i]);
        return { respostas: obj };
    });
}

// 📥 Upload
router.post('/upload', upload.single('file'), async (req,res)=>{
    const dados = parseCSV(req.file.buffer.toString());

    if (isConnected()) {
        await Response.insertMany(dados);
        return res.json({ modo: "banco", msg:"Dados salvos no MongoDB" });
    } else {
        dadosMemoria = dados;
        return res.json({ modo: "memoria", msg:"Dados armazenados temporariamente" });
    }
});

// 📄 PDF
router.get('/export/pdf', async (req,res)=>{
    let dados;

    if (isConnected()) {
        dados = await Response.find();
    } else {
        dados = dadosMemoria;
    }

    const resultado = analyzeResponses(dados);
    const insights = gerarInsights(resultado);

    const doc = new PDFDocument({ margin:70 });

    res.setHeader('Content-Type','application/pdf');
    res.setHeader('Content-Disposition','attachment; filename=relatorio.pdf');

    doc.pipe(res);

    doc.text('RELATÓRIO DE ANÁLISE', {align:'center'});
    doc.addPage();

    for (let p in resultado){
        doc.addPage();
        doc.text(`Pergunta: ${p}`);

        let r = resultado[p];

        let img = await gerarGrafico(p,r,'pie');
        doc.image(img,{width:400});

        img = await gerarGrafico(p,r,'line');
        doc.image(img,{width:400});

        for (let x in r){
            doc.text(`${x}: ${r[x]}`);
        }
    }

    doc.addPage();
    insights.forEach(i=> doc.text(i));

    let abertas = dados.map(d=>Object.values(d.respostas)).flat();
    let ia = analisarTexto(abertas);

    doc.addPage();
    doc.text(ia.resumo);

    doc.end();
});

module.exports = router;