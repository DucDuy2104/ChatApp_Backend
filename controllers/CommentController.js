const CommentModel = require("../models/CommentModel");

// Thêm bình luận
exports.createNewCmt = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, authorId } = req.body;

    const comment = new CommentModel({
      content,
      authorId,
      postId,
    });

    await comment.save();

    const populatedComment = await CommentModel.findById(comment._id)
      .populate("authorId", "name avatar")
      .exec();

    return res.status(200).json({
      status: true,
      message: "Comment created successfully",
      data: populatedComment,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
      error: "Server error",
    });
  }
};

// Lấy danh sách bình luận của bài viết
exports.getAllCmt = async (req, res) => {
  try {
    const { postId } = req.params;
    if (!postId) {
      throw new Error("This post is not exist!");
    }

    const comments = await CommentModel.find({
      postId,
    }).populate("authorId", "name");

    return res.status(200).json({
      status: true,
      message: "Get comments successfully",
      data: comments,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, message: err.message, error: "Server error" });
  }
};

// Cập nhật bình luận
exports.updatedCmt = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      return res.status(400).json({
        status: false,
        message: "Comment not found",
      });
    }

    if (!content || content.trim() === "") {
      return res.status(400).json({
        status: false,
        message: "Content is required",
      });
    }

    // Cập nhật bình luận
    comment.content = content;
    await comment.save();

    return res.status(200).json({
      status: true,
      message: "Comment updated successfully",
      data: comment,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
      error: "Server error",
    });
  }
};

// Xóa bình luận
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      return res.status(400).json({
        status: false,
        message: "Comment not found",
      });
    }

    await CommentModel.findByIdAndDelete(commentId);

    return res.status(200).json({
      status: true,
      message: "Comment deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
      error: "Server error",
    });
  }
};
