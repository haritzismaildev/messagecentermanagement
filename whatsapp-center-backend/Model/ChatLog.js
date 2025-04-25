const mongoose = require('mongoose');

const chatLogSchema = new mongoose.Schema({
  from: { type: String, required: true },
  body: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatLog', chatLogSchema);