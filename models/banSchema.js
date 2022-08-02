const mongoose = require("mongoose");

// Sub Schema
const loginHistory = new mongoose.Schema({
    login: { type: String, require: true },
    logout: { type: String, require: true }
})
// Main Schema
const banSchema = new mongoose.Schema({
    guildID: { type: String, index: true },
    steamID: { type: String, require: true },
});
// End Main Schema

const model = mongoose.model("bans", banSchema);

module.exports = model;