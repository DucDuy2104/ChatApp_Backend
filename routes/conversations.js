const express = require('express')
const router = express.Router()
const conversationController = require('../controllers/ConversationController')

//create conversation
//body: { participantIds }
router.post('/create-conversation', conversationController.createConversation)

//get conversation by id
//params: conversationId
router.post('/get-conversation-by-id', conversationController.getConversationById)

//get conversations by userId
//body: userId, lastConversationId
router.post('/get-conversations-by-user', conversationController.getConversationByUserId)



router.get('/', (req, res) => {
    res.send('Hello from conversation API')
})

module.exports = router