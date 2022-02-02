const mongoose = require("mongoose");
// Main Schema
const serverLogSchema = new mongoose.Schema({
    guildID: { type: String, require: true },
    category: { type: String, require: true },
    string: { type: String, require: true },
});
// End Main Schema

const model = mongoose.model("serverLogs", serverLogSchema);

module.exports = model;