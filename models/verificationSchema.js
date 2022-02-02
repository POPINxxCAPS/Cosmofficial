const mongoose = require("mongoose");
// Main Schema
const verificationSchema = new mongoose.Schema({
  userID: { type: String, require: true},
  username: { type: String, require: true},
});
// End Main Schema

const model = mongoose.model("verification", verificationSchema);

module.exports = model;