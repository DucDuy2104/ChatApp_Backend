const express =  require('express');
const router = express.Router();
const friendController = require('../controllers/FriendController')

// send request to friend
router.post('/send-request', friendController.sendRequest);

// accept or reject request
router.put('/accept-request/:friendRequestId', friendController.acceptRequest);
router.put('/reject-request/:friendRequestId', friendController.rejectRequest);




module.exports = router