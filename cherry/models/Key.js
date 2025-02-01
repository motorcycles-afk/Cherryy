import mongoose from 'mongoose';

const keySchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: String,
        required: false  
    },
    generatedAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    urls: [{
        type: String
    }],
    linkVerifications: [{
        step: Number,
        timestamp: Date,
        ipAddress: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add method to check if key is expired
keySchema.methods.isExpired = function() {
    return Date.now() >= this.expiresAt;
};

const Key = mongoose.model('Key', keySchema);
export default Key;
