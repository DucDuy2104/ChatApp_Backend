const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true, unique: true },
  passWord: { type: String, required: true },
  avatar: {
    type: String,
    default:
      "https://i.pinimg.com/736x/10/6d/77/106d7765ff225167f18019f8f50f1d73.jpg",
  },
  background: { type: String, default: "" },
  birthday: { type: Date },
  bio: { type: String, default: "" },
  blockedUsers: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  codeOTP: { type: String },
  codeExpiration: { type: Date },
  createAt: { type: Date, default: Date.now },
  updateAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.users || mongoose.model("user", userSchema);
