const mongoose = require('mongoose');

const componentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['operational', 'degraded', 'outage', 'maintenance'],
        default: 'operational'
    },
    uptime: {
        type: Number,
        default: 100
    },
    lastIncident: {
        type: Date
    }
});

const incidentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['investigating', 'identified', 'monitoring', 'resolved'],
        default: 'investigating'
    },
    severity: {
        type: String,
        enum: ['critical', 'major', 'minor'],
        default: 'minor'
    },
    affectedComponents: [{
        type: String
    }],
    updates: [{
        message: String,
        status: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    startTime: {
        type: Date,
        default: Date.now
    },
    resolvedTime: Date
});

const statusSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    importantInfo: {
        type: String,
        required: true
    },
    overallStatus: {
        type: String,
        enum: ['operational', 'degraded', 'major_outage', 'maintenance'],
        default: 'operational'
    },
    components: [componentSchema],
    metrics: {
        uptimeLastDay: {
            type: Number,
            default: 100
        },
        uptimeLastWeek: {
            type: Number,
            default: 100
        },
        uptimeLastMonth: {
            type: Number,
            default: 100
        },
        responseTime: {
            type: Number,
            default: 0
        }
    },
    maintenanceWindows: [{
        title: String,
        description: String,
        scheduledStart: Date,
        scheduledEnd: Date,
        status: {
            type: String,
            enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
            default: 'scheduled'
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const incidentModel = mongoose.model('Incident', incidentSchema);
const Status = mongoose.model('Status', statusSchema);

module.exports = {
    Status,
    Incident: incidentModel
};
