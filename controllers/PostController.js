const PostModel = require("../models/PostModel");
const UserModel = require("../models/UserModel");
const FriendModel = require("../models/FriendModel");

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

    const post = new PostModel({ content, authorId, attachments });
    await post.save();
    res
      .status(200)
      .json({ status: true, message: "Post successfully", data: post });
  } catch (err) {
    res
      .status(500)
      .json({ status: false, message: err.message, error: "Server error" });
  }
};

// Lấy danh sách bài viết
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

    // Lọc ra bạn bè ngoại trừ userId
    if (friends && friends.users) {
      friendIds = friends.users.filter((id) => id.toString() !== userId);
    }

    const authorIds = [userId, ...friendIds];

    const posts = await PostModel.find({
      authorId: { $in: authorIds },
    }).populate("authorId", "name");

    return res.status(200).json({
      status: true,
      message: "Get status successfylly",
      data: posts,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, message: err.message, error: "Server error" });
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
