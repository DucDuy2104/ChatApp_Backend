const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const participantSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    conversationId: {
        type: Schema.Types.ObjectId,
        ref: 'conversation',
        required: true
    },
    isMuted: {
        type: Boolean,
        default: false
    },
    isAccepted: {
        type: Boolean,
        default: true
    },
    role: {
        type: String,
        enum: ['member', 'deputy', 'admin'],
        default: 'member'
    },
    
})


module.exports = mongoose.models.participants || mongoose.model("participant", participantSchema);