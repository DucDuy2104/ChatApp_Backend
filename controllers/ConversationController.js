const Conversation = require('../models/ConversationModel');
const Participant = require('../models/ParticipantModel')

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


exports.createConversation = async (req, res) => {
    try {
        var { participantIds } = req.body
        participantIds = [...new Set(participantIds)]
        if (participantIds.length > 2) {
            return res.status(400).json({status: false, message: 'More than two participants are not allowed' })
        }
        if (participantIds.length === 2) {
            const checkExistingConversationData = await checkExistingConversation(participantIds)
            if (checkExistingConversationData.exists) {
                return res.status(400).json({ message: 'Conversation already exists' })
            } else {
                const conversation = await Conversation.create({})
                const participantsPromise = participantIds.map(participantId => Participant.create({ userId: participantId, conversationId: conversation._id }))
                await Promise.all(participantsPromise)
                return res.json({ status: true, data: conversation})
            }
        }

        const conversation = await Conversation.create({})
        const participantsPromise = participantIds.map((participantId, index) => Participant.create({userId: participantId, conversationId: conversation._id, role: index == 0? 'admin' : 'member'}))
        await Promise.all(participantsPromise)

        return res.status(200).json({ status: true, message: 'created conversation successfully', data: { conversationId: conversation._id}})
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
        const participants = await Participant.find({ conversationId:  conversation._id }).populate('userId', 'name avatar')
        return res.status(200).json({ status: true, data: { ...conversation, participants }})

    } catch (error) {
        console.error(error)
        return res.status(500).json({status: false, message: 'Server error' })
    }
}


