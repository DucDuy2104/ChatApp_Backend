const express = require('express');
const router = express.Router();
const messageContoller = require('../controllers/MessageController')


//send message
// body: {senderId, message, conversationId}
router.post('/send-message', messageContoller.sendMessage)


//add viewer
router.post('/add-viewer', messageContoller.addViewer)

router.get('/get-messages', messageContoller.getMessages)


router.get('/', function(req, res){
    res.send('Hello from message API');
})

module.exports = router