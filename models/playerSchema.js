const mongoose = require("mongoose");

// Sub Schema
const loginHistory = new mongoose.Schema({
    login: { type: String, require: true },
    logout: { type: String, require: true }
})
// Main Schema
const playersSchema = new mongoose.Schema({
    guildID: { type: String, index: true },
    steamID: { type: String, require: true },
    displayName: { type: String, require: true, index: true },
    factionName: { type: String, require: true },
    factionTag: { type: String, require: true, index: true },
    promoteLevel: { type: String, require: true },
    ping: { type: String, require: true },
    online: { type: Boolean, require: true, index: true },
    lastLogin: { type: String },
    lastLogout: { type: String },
    loginHistory: [loginHistory]
});
// End Main Schema

const model = mongoose.model("players", playersSchema);

module.exports = model;