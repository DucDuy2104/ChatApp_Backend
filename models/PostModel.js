const mongoose = require("mongoose");
const PostSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  attachments: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.posts || mongoose.model("post", PostSchema);
