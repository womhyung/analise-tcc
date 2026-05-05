const express = require('express');
const multer = require('multer');
const PDFDocument = require('pdfkit');

const Response = require('../models/Response');
const analyzeResponses = require('../services/analyzer');
const gerarGrafico = require('../services/chartGenerator');
const gerarInsights = require('../services/insights');
const analisarTexto = require('../services/aiAnalysis');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

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

router.post('/upload', upload.single('file'), async (req,res)=>{
    const dados = parseCSV(req.file.buffer.toString());
    await Response.insertMany(dados);
    res.json({ msg:"salvo" });
});

router.get('/export/pdf', async (req,res)=>{
    const dados = await Response.find();
    const resultado = analyzeResponses(dados);
    const insights = gerarInsights(resultado);

    const doc = new PDFDocument({ margin:70 });

    res.setHeader('Content-Type','application/pdf');
    res.setHeader('Content-Disposition','attachment; filename=relatorio.pdf');

    doc.pipe(res);

    let paginas = [];

    function titulo(t){
        paginas.push({t, p: doc.bufferedPageRange().count+1});
        doc.fontSize(14).text(t);
        doc.moveDown();
    }

    // CAPA
    doc.text('ANÁLISE DE QUESTIONÁRIO', {align:'center'});
    doc.addPage();

    titulo('1 INTRODUÇÃO');
    doc.text('Relatório automatizado.');

    for (let p in resultado){
        doc.addPage();
        titulo(`Pergunta: ${p}`);

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
    titulo('ANÁLISE');
    insights.forEach(i=> doc.text(i));

    let abertas = dados.map(d=>Object.values(d.respostas)).flat();
    let ia = analisarTexto(abertas);

    doc.addPage();
    titulo('ANÁLISE QUALITATIVA');
    doc.text(ia.resumo);

    doc.addPage();
    doc.text('SUMÁRIO');
    paginas.forEach(s=> doc.text(`${s.t} .... ${s.p}`));

    doc.end();
});

module.exports = router;