const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  userId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  groupId: { type: String, required: false },
  dateTime: { type: Date, required: true },
});

module.exports = mongoose.model("Item", itemSchema);
