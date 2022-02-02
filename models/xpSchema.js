const mongoose = require("mongoose");
// Main Schema
const xpSchema = new mongoose.Schema({
    userID: { type: String, require: true },
    xp: { type: String, require: true },
    level: { type: String, require: true },
    unusedUpgradeTokens: { type: String, require: true },
    usedUpgradeTokens: { type: String, require: true },
    cosmicBoostTokens: { type: String, require: true }
});
// End Main Schema

const model = mongoose.model("xps", xpSchema);

module.exports = model;xp