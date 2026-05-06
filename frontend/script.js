const API_URL = "https://analise-tcc.onrender.com";

let dadosEnviados = false;
let carregando = false;

// 🎯 Status
function setStatus(msg, cor = "#ccc") {
    const status = document.getElementById('status');
    status.innerText = msg;
    status.style.color = cor;
}

// 🔒 Bloquear botões durante processamento
function toggleButtons(disabled) {
    document.querySelectorAll("button").forEach(btn => {
        btn.disabled = disabled;
        btn.style.opacity = disabled ? 0.6 : 1;
    });
}

// 📊 Upload CSV
async function upload() {

    if (carregando) return;

    let f = document.getElementById('file').files[0];

    if (!f) {
        setStatus("⚠️ Selecione um arquivo CSV primeiro!", "orange");
        return;
    }

    if (!f.name.toLowerCase().endsWith(".csv")) {
        setStatus("❌ O arquivo deve ser .csv (exportado do Google Forms)", "red");
        return;
    }

    carregando = true;
    toggleButtons(true);

    let fd = new FormData();
    fd.append('file', f);

    setStatus("⏳ Processando dados do questionário...");

    try {
        const res = await fetch(`${API_URL}/api/upload`, {
            method: 'POST',
            body: fd
        });

        if (!res.ok) throw new Error("Erro no upload");

        const data = await res.json();

        dadosEnviados = true;

        setStatus(
            `✅ Dados analisados com sucesso (${data.modo})\n📁 ${f.name}`,
            "#4ade80"
        );

    } catch (err) {
        console.error(err);
        setStatus("❌ Falha ao enviar arquivo", "red");
    }

    carregando = false;
    toggleButtons(false);
}

// 📚 Upload Texto Base (PDF/DOC/TXT)
async function uploadBase() {

    if (carregando) return;

    let f = document.getElementById('baseFile').files[0];

    if (!f) {
        setStatus("⚠️ Selecione um arquivo de texto!", "orange");
        return;
    }

    const permitido = ['.pdf', '.doc', '.docx', '.txt'];

    if (!permitido.some(ext => f.name.toLowerCase().endsWith(ext))) {
        setStatus("❌ Formato inválido (use PDF, DOC ou TXT)", "red");
        return;
    }

    carregando = true;
    toggleButtons(true);

    let fd = new FormData();
    fd.append('file', f);

    setStatus("⏳ Integrando referencial teórico...");

    try {
        const res = await fetch(`${API_URL}/api/upload/base`, {
            method: 'POST',
            body: fd
        });

        if (!res.ok) throw new Error("Erro no upload base");

        setStatus(`📚 Texto base incorporado com sucesso\n📁 ${f.name}`, "#4ade80");

    } catch (err) {
        console.error(err);
        setStatus("❌ Erro ao enviar texto base", "red");
    }

    carregando = false;
    toggleButtons(false);
}

// 📄 Gerar PDF
async function pdf() {

    if (!dadosEnviados) {
        setStatus("⚠️ Envie os dados antes de gerar o relatório!", "orange");
        return;
    }

    if (carregando) return;

    carregando = true;
    toggleButtons(true);

    setStatus("📄 Gerando relatório completo...");

    try {

        const res = await fetch(`${API_URL}/api/export/pdf`);

        if (!res.ok) {
            throw new Error("Erro ao gerar PDF");
        }

        const blob = await res.blob();

        // 🔥 DOWNLOAD AUTOMÁTICO (funciona em todos navegadores)
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = "relatorio-tcc.pdf";

        document.body.appendChild(link);
        link.click();

        link.remove();
        window.URL.revokeObjectURL(url);

        setStatus("✅ PDF gerado e baixado com sucesso!", "#4ade80");

    } catch (err) {
        console.error(err);
        setStatus("❌ Erro ao gerar relatório", "red");
    }

    carregando = false;
    toggleButtons(false);
}