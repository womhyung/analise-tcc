async function upload(){
    let f = document.getElementById('file').files[0];
    let fd = new FormData();
    fd.append('file', f);

    await fetch('/api/upload',{method:'POST', body:fd});
    alert('enviado');
}

function pdf(){
    window.open('/api/export/pdf');
}