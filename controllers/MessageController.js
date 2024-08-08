const Message = require('../models/MessageModel')
exports.sendMessage = async (req,res) => {
    try {
        const { message, senderId, conversationId } = req.body;
        if (!message ||!senderId ||!conversationId) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const createdMessage = await Message.create({senderId, conversationId, message})
        return res.status(200).json({ status: true, message: 'created message successfully', data: createdMessage });
    } catch (error) {
        console.error(error)
        return res.status(500).json({ status: false, message: 'Server error' });
    }
}