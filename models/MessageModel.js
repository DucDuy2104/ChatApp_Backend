const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    senderId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    conversationId: {
        type: Schema.Types.ObjectId,
        ref: 'conversation',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['text', 'media', 'file', 'startFriend',  'notification'],
        default: 'text'
    },
    isMarked: {
        type: Boolean,
        default: false
    },
    viewers: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
})


module.exports = mongoose.models.messages || mongoose.model('message', messageSchema);