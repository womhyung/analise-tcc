const mongoose = require('mongoose');

const ResponseSchema = new mongoose.Schema({
    respostas: Object,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Response', ResponseSchema);