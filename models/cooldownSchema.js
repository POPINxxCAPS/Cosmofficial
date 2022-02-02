const mongoose = require('mongoose');
// Start main schema
const cooldownSchema = new mongoose.Schema({
    guildID: { type: String, require: true },
    userID: { type: String, require: true },
    commandString: { type: String, require: true },
    expirationTime: { type: Number, require: true },
}) // End Main Schema
const model = mongoose.model("cooldowns", cooldownSchema);
module.exports = model;