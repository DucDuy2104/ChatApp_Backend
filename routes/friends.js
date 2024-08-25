const express = require("express");
const router = express.Router();
const friendController = require("../controllers/FriendController");

// send request to friend
router.post("/send-request", friendController.sendRequest);

// accept or reject request
router.put("/accept-request/:friendRequestId", friendController.acceptRequest);
router.put("/reject-request/:friendRequestId", friendController.rejectRequest);

//Get sendrequest and receive request
router.get("/getall_friendRq/:senderId", friendController.getSendRequest);
router.get("/getall_receivedRq/:receiveId", friendController.getAllReceivedRQ);

//revoke request
router.put("/revoke_request", friendController.revokeRq);

module.exports = router;
