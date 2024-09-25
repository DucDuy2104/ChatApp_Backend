const mongoose = require("mongoose");
const PostSchema = new mongoose.Schema({
  content: {
    type: String,
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  attachments: [Object],
  likes: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "user",
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.posts || mongoose.model("post", PostSchema);
