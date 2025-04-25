const { default: mongoose } = require("mongoose");

// user skema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['CS', 'admin', 'superadmin', 'owner'],
        default: 'cs'
    },
    // Field opsional untuk menyimpan JWT token (jika diinginkan)
    jwtToken: {
        type: String
    }
}, { timestamps: true});

module.exports = mongoose.model('User', userSchema);