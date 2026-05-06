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

    // validações
    if (!f) {
        setStatus("⚠️ Selecione um arquivo CSV primeiro!", "orange");
        return;
    }

    if (!f.name.toLowerCase().endsWith(".csv")) {
        setStatus("❌ O arquivo deve ser .csv (Google Forms)", "red");
        return;
    }

    if (f.size > 5 * 1024 * 1024) {
        setStatus("❌ Arquivo muito grande (máx 5MB)", "red");
        return;
    }

    carregando = true;
    toggleButtons(true);

    let fd = new FormData();
    fd.append('file', f);

    setStatus("⏳ Enviando arquivo para análise...");

    try {

        const res = await fetch(`${API_URL}/api/upload`, {
            method: 'POST',
            body: fd
        });

        // 🔥 lê resposta como texto primeiro
        const text = await res.text();

        let data;

        try {
            data = JSON.parse(text);
        } catch {
            throw new Error("Resposta inválida do servidor (não é JSON)");
        }

        // 🔥 mostra erro real do backend
        if (!res.ok) {
            throw new Error(data.erro || "Erro no upload");
        }

        dadosEnviados = true;

        setStatus(
            `✅ Upload realizado com sucesso!\nModo: ${data.modo}\n📁 ${f.name}`,
            "#4ade80"
        );

    } catch (err) {
        console.error("ERRO REAL:", err);

        setStatus(`❌ ${err.message}`, "red");
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

    // 🔥 só aceita TXT (como você definiu no backend)
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

        const text = await res.text();

        let data;

        try {
            data = JSON.parse(text);
        } catch {
            throw new Error("Resposta inválida do servidor");
        }

        if (!res.ok) {
            throw new Error(data.erro || "Erro no upload do referencial");
        }

        setStatus(
            `📚 Referencial adicionado com sucesso!\n📁 ${f.name}`,
            "#4ade80"
        );

    } catch (err) {
        console.error(err);
        setStatus(`❌ ${err.message}`, "red");
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
            throw new Error("Erro ao gerar PDF no servidor");
        }

        const blob = await res.blob();

        // 🔥 verifica se PDF veio válido
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
        console.error("ERRO PDF:", err);
        setStatus(`❌ ${err.message}`, "red");
    }

    carregando = false;
    toggleButtons(false);
}