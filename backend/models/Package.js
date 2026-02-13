const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: Number, default: 30 }, // Days
});

module.exports = mongoose.model('Package', packageSchema);
