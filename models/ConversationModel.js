const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
    conversationName: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: 'https://cdn.pixabay.com/photo/2016/11/14/17/39/group-1824145_640.png'
    },
    background: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})


module.exports = mongoose.models.conversations || mongoose.model("conversation", conversationSchema);