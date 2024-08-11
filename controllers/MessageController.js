const Message = require('../models/MessageModel')
const socket = require('../socket')
exports.sendMessage = async (req,res) => {
    try {
        const { message, senderId, conversationId } = req.body;
        if (!message ||!senderId ||!conversationId) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const createdMessage = await Message.create({senderId, conversationId, message})
        const messageReturn = await Message.findById(createdMessage._id).populate('senderId', 'name avatar')
        socket.getIo().emit('sendMessage', {
            message: messageReturn
        })
        return res.status(200).json({ status: true, message: 'created message successfully', data: message });
    } catch (error) {
        console.error(error)
        return res.status(500).json({ status: false, message: 'Server error' });
    }
}