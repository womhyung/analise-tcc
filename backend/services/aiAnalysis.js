function analisarTexto(lista) {
    let palavras = lista.join(' ').toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/);

    let freq = {};

    palavras.forEach(p => {
        if (p.length > 3)
            freq[p] = (freq[p] || 0) + 1;
    });

    let top = Object.entries(freq)
        .sort((a,b)=>b[1]-a[1])
        .slice(0,5)
        .map(p=>p[0]);

    return {
        resumo: "Principais temas: " + top.join(', '),
        palavrasChave: top
    };
}

module.exports = analisarTexto;