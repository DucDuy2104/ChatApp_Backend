const mongoose= require('mongoose');
const Schema = require('mongoose')

const friendRequest = new Schema({
    userSent: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    userRecieved: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    message: {
        type: String,
        default: 'Xin chào! Kết bạn với mình nhé'
    }
}, {
    timestamps: true
})


module.exports = mongoose.models.friendRequests || mongoose.model('friendRequest', friendRequest)