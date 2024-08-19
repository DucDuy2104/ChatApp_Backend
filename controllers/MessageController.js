const Message = require('../models/MessageModel')
const socket = require('../socket')
exports.sendMessage = async (req, res) => {
    try {
        const { message, senderId, conversationId } = req.body;
        if (!message || !senderId || !conversationId) {
            return res.status(400).json({ status: false, message: "Missing required fields" });
        }
        const createdMessage = await Message.create({ senderId, conversationId, message })
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


exports.addViewer = async (req, res) => {
    try {
        const { conversationId, viewerId } = req.body
        if (!conversationId || !viewerId) {
            return res.status(400).json({ status: false, message: "Missing required fields" });
        }
        const listMessage = await Message.find({ conversationId: conversationId, viewers: { $ne: userId } })
        const listMessagePromise = listMessage.map(message => {
            message.viewers.push(viewerId)
            return message.save()
        })
        await Promise.all(listMessagePromise)
        return res.status(200).json({ status: true, message: 'added viewer successfully' });
    } catch (error) {
        console.log('err: ', error)
        return res.status(500).json({ status: false, message: 'Server error' });
    }
}


exports.getMessages = async (req, res) => {
    try {
        const { conversationId, startMessageId } = req.body;
        if (!conversationId) {
            return res.status(400).json({ status: false, message: "Missing required fields" });
        }
        var messages;
        if (startMessageId) {
            const startMessage = await Message.findById(startMessageId);
            const startDate = startMessage.createdAt;
            messages = await Message.find({ createdAt: { $gt: startDate }}).populate('senderId', 'name avatar')
        } else {
            messages = await Message.find({ conversationId: conversationId }).populate('senderId', 'name avatar')
        }
        return res.status(200).json({ status: true, data: messages });
    } catch (error) {
        console.error(error)
        return res.status(500).json({ status: false, message: 'Server error' });
    }
}
