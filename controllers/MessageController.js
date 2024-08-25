const Message = require('../models/MessageModel')
const Participant = require('../models/ParticipantModel')
const socket = require('../socket')
exports.sendMessage = async (req, res) => {
    try {
        const { message, senderId, conversationId, type } = req.body;
        if (!message || !senderId || !conversationId) {
            return res.status(400).json({ status: false, message: "Missing required fields" });
        }
        const createdMessage = await Message.create({ senderId, conversationId, message, type: type || "text", viewers: [senderId] })
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
        const listMessage = await Message.find({ conversationId: conversationId, viewers: { $ne: viewerId } })
        const listMessagePromise = listMessage.map(message => {
            message.viewers.push(viewerId)
            return message.save()
        })
        await Promise.all(listMessagePromise)
        socket.getIo().emit('addViewer', {
            conversationId,
            viewerId
        })
        return res.status(200).json({ status: true, message: 'added viewer successfully' });
    } catch (error) {
        console.log('err: ', error)
        return res.status(500).json({ status: false, message: 'Server error' });
    }
}

exports.getMessages = async (req, res) => {
    try {
        const { conversationId, MessageId } = req.query;
        if (!conversationId) {
            return res.status(400).json({ status: false, message: "Missing required fields" });
        }
        var messages;
        if (MessageId) {
            const Message = await Message.findById(MessageId);
            const Date = Message.createdAt;
            messages = await Message.find({ createdAt: { $gt: Date } }).populate('senderId', 'name avatar')
        } else {
            messages = await Message.find({ conversationId: conversationId }).populate('senderId', 'name avatar')
        }
        return res.status(200).json({ status: true, data: messages });

    } catch (error) {
        console.error(error)
        return res.status(500).json({ status: false, message: 'Server error' });
    }
}


exports.getMessagesByUser = async (req, res) => {
    try {
        const { userId, lastDateISOString } = req.query;

        if (!userId) {
            return res.status(400).json({ status: false, message: "Missing required fields" });
        }

        const lastDate = lastDateISOString ? new Date(lastDateISOString) : null;

        const conversationIds = await Participant.find({ userId }).distinct('conversationId');

        const messagePromises = conversationIds.map(async (conversationId) => {
            const query = lastDate
                ? { conversationId, createdAt: { $gt: lastDate } }
                : { conversationId };

            const messagesData = await Message.find(query).populate('senderId', 'name avatar');
            return messagesData;
        });

        const messages = (await Promise.all(messagePromises)).flat();

        return res.status(200).json({ status: true, message: 'Get messages successfully', data: messages });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};
