const mongoose = require('mongoose');

let conectado = false;

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        console.log("⚠️ MongoDB não configurado. Usando modo memória.");
        return false;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB conectado");
        conectado = true;
        return true;
    } catch (err) {
        console.log("❌ Erro MongoDB. Usando modo memória.");
        return false;
    }
};

const isConnected = () => conectado;

module.exports = { connectDB, isConnected };