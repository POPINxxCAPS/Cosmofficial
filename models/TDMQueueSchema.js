const mongoose = require("mongoose");
// Main Schema
const queueSchema = new mongoose.Schema({
  userID: { type: String, require: true, unique: true },
  username: { type: String, require: true, unique: true },
  gamertag: { type: String, require: true, unique: true },
  expirationTime: { type: String, require: true },
});
// End Main Schema

const model = mongoose.model("tdmQueue", queueSchema);

module.exports = model;