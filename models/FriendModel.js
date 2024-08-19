const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Friend = new Schema({
    users: [{
        type: Schema.Types.ObjectId,
        ref: 'user'
    }]
}, {
    timestamps: true
})


module.exports = mongoose.models.friends || mongoose.model('friend', Friend);