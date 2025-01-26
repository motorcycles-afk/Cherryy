const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    importantInfo: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Status', statusSchema);
