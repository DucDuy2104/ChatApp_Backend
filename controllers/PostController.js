const Post = require("../models/PostModel");
const User = require("../models/UserModel");

// Đăng bài viết mới
exports.postStatus = async (req, res) => {
  const { content, authorId, attachments } = req.body;
  try {
    if (!content && authorId) {
      return res.status(400).json({
        status: false,
        message: "Content and authorId is required!",
      });
    }

    const checkAuth = await User.findById(authorId);
    if (!checkAuth) {
      return res.status(400).json({
        status: false,
        message: "User error",
      });
    }

    const post = new Post({ content, authorId, attachments });
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
