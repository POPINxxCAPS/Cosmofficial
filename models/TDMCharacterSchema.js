const mongoose = require("mongoose");
// Main Schema
const queueSchema = new mongoose.Schema({
  userID: { type: String, require: true, unique: true },
  gamertag: { type: String, require: true, unique: true },
  team: { type: String, require: true },
  alive: { type: Boolean, require: true },
  leftSpawn: { type: Boolean }
});
// End Main Schema

const model = mongoose.model("tdmCharacters", queueSchema);

module.exports = model;