const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const asssetModel = new Schema({
    messageId: {
        type: Schema.Types.ObjectId,
        ref: 'message',
        required: true
    },
    assetUrl: {
        type: String,
        required: true
    }, 
    assetType: {
        type: String,
        enum: ['image', 'video', 'audio'],
        required: true
    }
})


module.exports = mongoose.models.assets || mongoose.model('asset', asssetModel);