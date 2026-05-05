const API_URL = "https://analise-tcc.onrender.com";

async function upload() {
    let f = document.getElementById('file').files[0];

    if (!f) {
        alert("Selecione um arquivo primeiro!");
        return;
    }

    let fd = new FormData();
    fd.append('file', f);

    try {
        const res = await fetch(`${API_URL}/api/upload`, {
            method: 'POST',
            body: fd
        });

        const data = await res.json();

        alert(`Upload realizado! Modo: ${data.modo}`);
    } catch (err) {
        console.error(err);
        alert("Erro ao enviar arquivo");
    }
}

function pdf() {
    window.open(`${API_URL}/api/export/pdf`);
}