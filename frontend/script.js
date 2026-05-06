const API_URL = "https://analise-tcc.onrender.com";

let dadosEnviados = false;
let carregando = false;

// 🎯 Status
function setStatus(msg, cor = "#ccc") {
    const status = document.getElementById('status');
    status.innerText = msg;
    status.style.color = cor;
}

// 🔒 Controle de botões
function toggleButtons(disabled) {
    document.querySelectorAll("button").forEach(btn => {
        btn.disabled = disabled;
        btn.style.opacity = disabled ? 0.6 : 1;
        btn.style.cursor = disabled ? "not-allowed" : "pointer";
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
        setStatus("❌ O arquivo deve ser .csv (Google Forms)", "red");
        return;
    }

    // 🔍 valida tamanho (evita travar)
    if (f.size > 5 * 1024 * 1024) {
        setStatus("❌ Arquivo muito grande (máx 5MB)", "red");
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
            `✅ Dados enviados com sucesso!\nModo: ${data.modo}\nArquivo: ${f.name}`,
            "#4ade80"
        );

    } catch (err) {
        console.error(err);
        setStatus("❌ Falha ao enviar arquivo. Verifique o servidor.", "red");
    }

    carregando = false;
    toggleButtons(false);
}

// 📚 Upload Texto Base
async function uploadBase() {

    if (carregando) return;

    let f = document.getElementById('baseFile').files[0];

    if (!f) {
        setStatus("⚠️ Selecione um arquivo de texto!", "orange");
        return;
    }

    // 🔥 AGORA CORRETO: só texto
    if (!f.name.toLowerCase().endsWith(".txt")) {
        setStatus("❌ Use apenas arquivos .txt para o referencial", "red");
        return;
    }

    carregando = true;
    toggleButtons(true);

    let fd = new FormData();
    fd.append('file', f);

    setStatus("⏳ Enviando referencial teórico...");

    try {
        const res = await fetch(`${API_URL}/api/upload/base`, {
            method: 'POST',
            body: fd
        });

        if (!res.ok) throw new Error("Erro no upload base");

        setStatus(`📚 Referencial adicionado com sucesso!\nArquivo: ${f.name}`, "#4ade80");

    } catch (err) {
        console.error(err);
        setStatus("❌ Erro ao enviar referencial", "red");
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

        // 🔥 VERIFICA SE VEM VAZIO
        if (blob.size < 1000) {
            throw new Error("PDF vazio ou inválido");
        }

        const url = window.URL.createObjectURL(blob);

        // 📥 download automático
        const link = document.createElement('a');
        link.href = url;
        link.download = "relatorio-tcc.pdf";

        document.body.appendChild(link);
        link.click();

        link.remove();
        window.URL.revokeObjectURL(url);

        setStatus("✅ Relatório gerado e baixado com sucesso!", "#4ade80");

    } catch (err) {
        console.error(err);
        setStatus("❌ Erro ao gerar relatório. Tente novamente.", "red");
    }

    carregando = false;
    toggleButtons(false);
}