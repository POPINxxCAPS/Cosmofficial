const mongoose = require("mongoose");
// Main Schema
const temporaryStatSchema = new mongoose.Schema({
    guildID: { type: String, require: true },
    name: { type: String, require: true },
    value: { type: String, require: true },
    factionTag: { type: String },
    username: { type: String }
});
// End Main Schema

const model = mongoose.model("temporarystat", temporaryStatSchema);

module.exports = model;