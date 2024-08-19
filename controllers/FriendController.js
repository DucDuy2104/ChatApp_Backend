const FriendRequest = require('../models/FriendRequestModel')
const Friend = require('../models/FriendModel');


exports.sendRequest = async (req, res) => {
    try {
        const { userSent, userRecieved, message } = req.body;
        if (!userSent ||!userRecieved) {
            return res.status(400).json({status: false, message: "Missing required fields" });
        }

        const existingRequest = await FriendRequest.findOne({ userSent, userRecieved });
        if (existingRequest) {
            return res.status(400).json({status: false, message: "Friend request already sent" });
        }
        
        const friendRequest = await FriendRequest.create({ userSent, userRecieved, message: message || "Xin chào! Kết bạn với mình nhé." });
        return res.status(200).json({status: true, message: "Friend request sent successfully", data: friendRequest});
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: false, message: "Server error" });
        
    }
}


exports.acceptRequest = async (req, res) => {
    try {
        const { friendRequestId }= req.params;
        const friendRequest = await FriendRequest.findById(friendRequestId);
        if (!friendRequest) {
            return res.status(404).json({status: false, message: "Friend request not found" });
        }
        const friend = await Friend.create({users: [friendRequest.userSent, friendRequest.userRecieved]})
        await FriendRequest.findByIdAndDelete(friendRequestId);
        return res.status(200).json({status: true, message: "Friend request accepted successfully", data: friend});
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: false, message: "Server error" });
    }
}

exports.rejectRequest = async (req, res) => {
    try {
        const { friendRequestId } = req.params
        const friendRequest = await FriendRequest.findById(friendRequestId);
        if (!friendRequest) {
            return res.status(404).json({status: false, message: "Friend request not found" });
        }
        await FriendRequest.findByIdAndDelete(friendRequestId);
        return res.status(200).json({status: true, message: "Friend request rejected successfully"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: false, message: "Server error" });
        
    }
}