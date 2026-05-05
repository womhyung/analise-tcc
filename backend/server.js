const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./config/db');

const app = express();

// 🔌 Conexão (modo híbrido)
connectDB();

// 🌐 CORS liberado (importante pro frontend local)
app.use(cors({
    origin: '*'
}));

// 📦 Middleware
app.use(express.json());

// 🔗 Rotas
app.use('/api', require('./routes/analyze'));

// 🧪 Rota de teste (IMPORTANTE pra saber se está online)
app.get('/', (req, res) => {
    res.send('API do Sistema TCC está funcionando 🚀');
});

// 🚀 Porta
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});