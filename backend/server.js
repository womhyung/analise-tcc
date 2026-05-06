const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./config/db');

const app = express();

// 🔌 Conectar ao banco (modo híbrido)
connectDB();

// 🌐 CORS (libera acesso do front)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// 📦 IMPORTANTE: limites para evitar erro no upload
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 🔗 Rotas
app.use('/api', require('./routes/analyze'));

// 🧪 Rota de teste
app.get('/', (req, res) => {
    res.send('API do Sistema TCC está funcionando 🚀');
});

// ❌ TRATAMENTO GLOBAL DE ERROS (ESSENCIAL)
app.use((err, req, res, next) => {
    console.error("🔥 ERRO GLOBAL:", err);
    res.status(500).json({ erro: "Erro interno no servidor" });
});

// 🚀 Porta
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});