const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const assetSchema = new Schema({
  messageId: {
    type: Schema.Types.ObjectId,
    ref: "message",
  },
  type: { type: String },
  assetUrl: { type: String },
  width: { type: Number },
  height: { type: Number },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.assets || mongoose.model("asset", assetSchema);
