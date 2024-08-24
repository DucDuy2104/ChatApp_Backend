const FriendRequest = require("../models/FriendRequestModel");
const Friend = require("../models/FriendModel");
const Conversation = require("../models/ConversationModel");
const Participant = require("../models/ParticipantModel");
const socket = require("../socket");

async function checkExistingConversation(listUser) {
  const existingConversations = await Participant.find({
    userId: { $in: listUser },
  }).distinct("conversationId");

  for (let conversationId of existingConversations) {
    const participants = await Participant.find({ conversationId }).distinct(
      "userId"
    );

    if (
      participants.length === listUser.length &&
      participants.every((id) => listUser.includes(id.toString()))
    ) {
      return { exists: true, conversationId };
    }
  }

  return { exists: false };
}

exports.sendRequest = async (req, res) => {
  try {
    const { userSent, userRecieved, message } = req.body;
    if (!userSent || !userRecieved) {
      return res
        .status(400)
        .json({ status: false, message: "Missing required fields" });
    }

    const existingRequest = await FriendRequest.findOne({
      userSent,
      userRecieved,
    });
    if (existingRequest) {
      return res
        .status(400)
        .json({ status: false, message: "Friend request already sent" });
    }

    const friendRequest = await FriendRequest.create({
      userSent,
      userRecieved,
      message: message || "Xin chào! Kết bạn với mình nhé.",
    });
    return res.status(200).json({
      status: true,
      message: "Friend request sent successfully",
      data: friendRequest,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    const { friendRequestId } = req.params;
    const friendRequest = await FriendRequest.findById(friendRequestId);
    if (!friendRequest) {
      return res
        .status(404)
        .json({ status: false, message: "Friend request not found" });
    }
    const friend = await Friend.create({
      users: [friendRequest.userSent, friendRequest.userRecieved],
    });
    const checkExistingConversationData = await checkExistingConversation([
      friendRequest.userSent,
      friendRequest.userRecieved,
    ]);
    if (!checkExistingConversationData.exists) {
      const conversation = await Conversation.create({});
      const participantsPromise = [
        Participant.create({
          userId: friendRequest.userSent,
          conversationId: conversation._id,
        }),
        Participant.create({
          userId: friendRequest.userRecieved,
          conversationId: conversation._id,
        }),
      ];
      await Promise.all(participantsPromise);
      socket.getIo().emit("createConversation", {
        conversationId: conversation._id,
      });
    }
    await FriendRequest.findByIdAndDelete(friendRequestId);
    return res.status(200).json({
      status: true,
      message: "Friend request accepted successfully",
      data: friend,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const { friendRequestId } = req.params;
    const friendRequest = await FriendRequest.findById(friendRequestId);
    if (!friendRequest) {
      return res
        .status(404)
        .json({ status: false, message: "Friend request not found" });
    }
    await FriendRequest.findByIdAndDelete(friendRequestId);
    return res
      .status(200)
      .json({ status: true, message: "Friend request rejected successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

//Get all send request by SenderId
exports.getSendRequest = async (req, res) => {
  try {
    const { senderId } = req.params;

    const friendRequests = await FriendRequest.find({ userSent: senderId })
      .populate("userRecieved", "-password")
      .exec();

    if (!friendRequests.length) {
      return res
        .status(404)
        .json({ message: "No friend requests found for this user" });
    }

    const responseData = friendRequests.map((request) => ({
      requestId: request._id,
      userRecieved: request.userRecieved,
    }));

    res.status(200).json({ status: true, data: responseData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

// API to get all
exports.getAllReceivedRQ = async (req, res) => {
  try {
    const { receiveId } = req.params;

    const friendRequests = await FriendRequest.find({ userRecieved: receiveId })
      .populate("userSent", "-password")
      .exec();

    if (!friendRequests.length) {
      console.log("No friend requests found for this user");
      return res
        .status(404)
        .json({ message: "No friend requests found for this user" });
    }

    const responseData = friendRequests.map((request) => ({
      requestId: request._id,
      userSent: request.userSent,
    }));

    res.status(200).json({ status: true, data: responseData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

//revoke request
exports.revokeRq = async (req, res) => {
  try {
    const { userSent, userRecieved } = req.body;

    if (!userSent || !userRecieved) {
      console.log("Missing required fields");
      return res
        .status(400)
        .json({ status: false, message: "Missing required fields" });
    }

    const result = await FriendRequest.findOneAndDelete({
      userSent,
      userRecieved,
    });

    if (!result) {
      console.log("Friend request not found");
      return res
        .status(404)
        .json({ status: false, message: "Friend request not found" });
    }

    return res.status(200).json({
      status: true,
      message: "Friend request revoke successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};
