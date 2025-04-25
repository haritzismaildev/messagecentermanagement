const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    code: {
        type: String, 
        required: true
    },
    email: {
        type: String,
        required: true
    },
    username: {
        type: String
    },
    ipAddress: {
        type: String
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, { timestamps: true, collection: 'otps' }); // Pastikan collection adalah 'otps'

module.exports = mongoose.model('OTP', otpSchema);