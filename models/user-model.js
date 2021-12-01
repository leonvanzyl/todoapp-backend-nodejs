const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  name: { type: String, required: true },
  items: [{ type: mongoose.Types.ObjectId, required: true, ref: "Item" }],
  groups: [{ type: mongoose.Types.ObjectId, required: true, ref: "Group" }],
  dateTime: { type: Date, required: true },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
