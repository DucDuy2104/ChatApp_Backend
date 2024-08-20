const Conversation = require('../models/ConversationModel');
const Participant = require('../models/ParticipantModel')
const Message = require('../models/MessageModel')

async function checkExistingConversation(listUser) {
    const existingConversations = await Participant.find({ userId: { $in: listUser } })
        .distinct('conversationId');

    for (let conversationId of existingConversations) {
        const participants = await Participant.find({ conversationId })
            .distinct('userId');

        if (participants.length === listUser.length && participants.every(id => listUser.includes(id.toString()))) {
            return { exists: true, conversationId };
        }
    }

    return { exists: false };
}

async function getInformation(conversation, userId) {
    let avatar = "";
    let name = "";
    const participants = await Participant.find({ conversationId: conversation._id }).populate('userId', 'name avatar')
    if (participants.length === 2) {
        const otherUser = participants.find(participant => participant.userId._id !== userId).userId
        avatar = otherUser.avatar
        name = otherUser.name
    } else {
        avatar = conversation.avatar
        if(conversation.conversationName) {
            name = conversation.conversationName
        } else {
            for (const participant of participants) {
                if(participant.userId._id !== userId ) {
                    name += participant.userId.name + ", "
                }
            }
        }
    }
    return {
        image: avatar,
        conversationName: name.slice(0, -2),
        participantsCount: participants.length
    };
}

async function getLastMessage(conversation) {
    const messages = await Message.find({ conversationId: conversation._id }).sort({ createdAt: -1 }).limit(1)
    if (messages.length > 0) {
        return messages[0]
    }
    return '';
}


exports.createConversation = async (req, res) => {
    try {
        var { userId } = req.body
        userId = [...new Set(userId)]
        if (userId.length > 2) {
            return res.status(400).json({ status: false, message: 'More than two participants are not allowed' })
        }
        if (userId.length === 2) {
            const checkExistingConversationData = await checkExistingConversation(userId)
            if (checkExistingConversationData.exists) {
                return res.status(400).json({ status: false, message: 'Conversation already exists', data: checkExistingConversationData.conversationId })
            } else {
                const conversation = await Conversation.create({})
                const participantsPromise = userId.map(participantId => Participant.create({ userId: participantId, conversationId: conversation._id }))
                await Promise.all(participantsPromise)
                return res.json({ status: true, data: conversation })
            }
        }

        const conversation = await Conversation.create({})
        const participantsPromise = userId.map((participantId, index) => Participant.create({ userId: participantId, conversationId: conversation._id, role: index == 0 ? 'admin' : 'member' }))
        await Promise.all(participantsPromise)

        return res.status(200).json({ status: true, message: 'created conversation successfully', data: { conversationId: conversation._id } })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}


exports.getConversationById = async (req, res) => {
    try {
        const { conversationId } = req.params
        const conversation = await Conversation.findById(conversationId)
        if (!conversation) {
            return res.status(404).json({ status: false, message: 'Conversation not found' })
        }
        const participants = await Participant.find({ conversationId: conversation._id }).populate('userId', 'name avatar')
        const info = await getInformation(conversation)
        return res.status(200).json({ status: true, data: { ...conversation, participants, ...info } })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ status: false, message: 'Server error' })
    }
}

exports.getConversationByUserId = async (req, res) => {
    try {
        const { userId } = req.params
        if(!userId) {
            return res.status(400).json({ status: false, message: 'User id is required' })
        }
        const conversationIds = await Participant.find({ userId }).distinct('conversationId')
        const conversations = await Conversation.find({ _id: { $in: conversationIds } });
        const conversationPromises = conversations.map(async conversation => {
            const info = await getInformation(conversation, userId)
            const lastMessage = await getLastMessage(conversation)
            return {
                ...conversationPromises._doc,
                ...info,
                lastMessage
            }
        })

        await Promise.all(conversationPromises)
        return res.status(200).json({ status: true, data: conversationPromises })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ status: false, message: 'Server error' })

    }
}





