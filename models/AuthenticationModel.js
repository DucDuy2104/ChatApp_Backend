const mongoose = require("mongoose");
const authenSchema = mongoose.Schema({
  phoneNumber: { type: String, unique: true, required: true },
  otp: { type: String },
  createdAt: { type: Date, expires: "1m", default: Date.now },
  updateAt: { type: Date, default: Date.now },
});

module.exports =
  mongoose.models.authencations || mongoose.model("authencation", authenSchema);
