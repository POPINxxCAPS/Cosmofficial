const mongoose = require("mongoose");
// Main Schema
const whitelistSchema = new mongoose.Schema({
    guildID: { type: String },
    enabled: { type: Boolean }
});
// End Main Schema

const model = mongoose.model("whitelistSettings", whitelistSchema);

module.exports = model;