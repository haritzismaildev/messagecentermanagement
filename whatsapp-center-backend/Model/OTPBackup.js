const mongoose = require('mongoose');

const otpBackupSchema = new mongoose.Schema({
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
  }, { timestamps: true, collection: 'otps_backup' });
  
  module.exports = mongoose.model('BackupOTP', otpBackupSchema);