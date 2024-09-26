const PostModel = require("../models/PostModel");
const UserModel = require("../models/UserModel");
const FriendModel = require("../models/FriendModel");
const AssetModel = require("../models/AssetModel");

// Đăng bài viết mới
exports.postStatus = async (req, res) => {
  const { content, authorId, attachments } = req.body;
  try {
    if (!content && (!attachments || attachments.length === 0)) {
      return res.status(400).json({
        status: false,
        message: "At least one of content or attachments is required!",
      });
    }

    if (!authorId) {
      return res.status(400).json({
        status: false,
        message: " authorId is required!",
      });
    }

    const checkAuth = await UserModel.findById(authorId);
    if (!checkAuth) {
      return res.status(400).json({
        status: false,
        message: "User error",
      });
    }

    let attachmentIds = [];
    if (attachments && attachments.length > 0) {
      for (let attachment of attachments) {
        const newAsset = await AssetModel.create({
          type: attachment.type,
          assetUrl: attachment.data,
        });

        attachmentIds.push(newAsset._id);
      }
    }

    const post = new PostModel({
      content,
      authorId,
      attachments: attachmentIds,
    });
    await post.save();

    return res
      .status(200)
      .json({ status: true, message: "Post successfully", data: post });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: false, message: err.message, error: "Server error" });
  }
};

exports.getStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User id is required!" });
    }

    // Tìm bạn bè
    const friends = await FriendModel.findOne({ users: userId }).select(
      "users"
    );

    let friendIds = [];

    if (friends && friends.users) {
      friendIds = friends.users.filter((id) => id.toString() !== userId);
    }

    const authorIds = [userId, ...friendIds];

    const posts = await PostModel.find({
      authorId: { $in: authorIds },
    })
      .populate("authorId", "name avatar")
      .populate({
        path: "attachments",
        select: "type assetUrl",
      })
      .populate({
        path: "likes",
        select: "name",
      });

    const formattedPosts = posts.map((post) => ({
      _id: post._id,
      content: post.content,
      author: post.authorId.name,
      avatar: post.authorId.avatar,
      attachments: post.attachments,
      likeCount: post.likes.length,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }));

    return res.status(200).json({
      status: true,
      message: "Get status successfully",
      data: formattedPosts,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
      error: "Server error",
    });
  }
};

// Lấy chi tiết bài viết
exports.getStatusDetail = async (req, res) => {
  try {
    const { idStatus } = req.params;
    const post = await PostModel.findById(idStatus).populate(
      "authorId",
      "name"
    );
    return res.status(200).json({
      status: true,
      message: "Get status detail successfully!",
      data: post,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, message: err.message, error: "Server error" });
  }
};

// Cập nhật bài viết
exports.updateStatus = async (req, res) => {
  try {
    const { idStatus } = req.params;
    const { content, attachments } = req.body;

    if (content.trim() === "") {
      throw new Error("Content í required!");
    }

    const postInDB = await PostModel.findById(idStatus);
    if (!postInDB) {
      throw new Error("This status is not existed!");
    }

    const newContent = content || postInDB.content;

    const newAttachments = attachments ? attachments : postInDB.attachments;

    const updatedPost = await PostModel.findByIdAndUpdate(
      idStatus,
      {
        content: newContent,
        attachments: newAttachments,
      },
      { new: true }
    );

    return res.status(200).json({
      status: true,
      message: "Updated status successfully",
      data: updatedPost,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, message: err.message, error: "Server error" });
  }
};

// Xóa bài viết
exports.deleteStatus = async (req, res) => {
  try {
    const idStatus = req.params.idStatus;
    await PostModel.findByIdAndDelete(idStatus);
    return res.status(200).json({ status: true, message: "Post deleted" });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, message: err.message, error: "Server error" });
  }
};

// Thích bài viết
exports.likePost = async (req, res) => {
  try {
    const { idStatus } = req.params;
    const { userId } = req.body;

    if (idStatus.trim === "" || userId.trim() === "") {
      return res.status(400).json({ error: "All id is required!" });
    }

    const post = await PostModel.findById(idStatus);
    if (!post) {
      return res.status(400).json({ error: "This post is not exist!" });
    }

    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    return res.status(200).json({
      status: true,
      message: post.likes.includes(userId) ? "Like" : "Unliked",
      data: post.likes.length,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, message: err.message, error: "Server error" });
  }
};
