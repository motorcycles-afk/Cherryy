const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
    component: {
        type: String,
        required: true,
        enum: [
            'api', 
            'executor', 
            'maintenance',
            'script_hub',
            'key_system',
            'discord_bot',
            'website',
            'database'
        ]
    },
    status: {
        type: String,
        required: true,
        enum: [
            'online',
            'offline',
            'maintenance',
            'updating',
            'degraded',
            'partial_outage'
        ],
        default: 'online'
    },
    visibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    },
    message: {
        type: String,
        default: ''
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Status', statusSchema); 