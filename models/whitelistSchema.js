const mongoose = require("mongoose");
// Main Schema
const whitelistSchema = new mongoose.Schema({
    guildID: { type: String },
    username: { type: String }
});
// End Main Schema

const model = mongoose.model("whitelists", whitelistSchema);

module.exports = model;