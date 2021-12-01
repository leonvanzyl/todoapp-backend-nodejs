const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  title: { type: String, required: true },
  userId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  items: [{ type: mongoose.Types.ObjectId, required: true, ref: "Item" }],
  dateTime: { type: Date, required: true },
});

module.exports = mongoose.model("Group", groupSchema);
