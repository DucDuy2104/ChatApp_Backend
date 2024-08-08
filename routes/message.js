const express = require('express');
const router = express.Router();
const messageContoller = require('../controllers/MessageController')


//send message
// body: {senderId, message, conversationId}
router.post('/send-message', messageContoller.sendMessage)

router.get('/', function(req, res){
    res.send('Hello from message API');
})

module.exports = router