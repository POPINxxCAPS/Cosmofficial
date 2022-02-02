const mongoose = require("mongoose");
// Main Schema
const spawnerSchema = new mongoose.Schema({
  guildID: { type: String, require: true },
  gridName: { type: String, require: true },
  expirationTime: { type: String, require: true }
});
// End Main Schema

const model = mongoose.model("spawners", spawnerSchema);

module.exports = model;