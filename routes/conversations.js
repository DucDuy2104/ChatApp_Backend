const express = require('express')
const router = express.Router()
const conversationController = require('../controllers/ConversationController')

//create conversation
//body: { participantIds }
router.post('/create-conversation', conversationController.createConversation)

//get conversation by id
//params: conversationId
router.get('/get-conversation-by-id/:conversationId', conversationController.getConversationById)

//get conversations by userId
//params: userId
router.get('/get-conversations', conversationController.getConversationByUserId)



router.get('/', (req, res) => {
    res.send('Hello from conversation API')
})

module.exports = router