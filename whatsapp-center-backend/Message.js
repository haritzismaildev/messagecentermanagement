const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { type: String, required: true },
    recipient: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    direction: { type: String, enum: ['inbound', 'outbound'], required: true }
});

module.exports = mongoose.model('Message', messageSchema);