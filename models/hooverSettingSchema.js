const mongoose = require("mongoose");
// Main Schema
const hooverSchema = new mongoose.Schema({
    guildID: { type: String, require: true, unique: true },
    hooverEnabled: { type: Boolean, require: true },
    nextCleanup: { type: String, require: true },
    cleanupInterval: { type: String, require: true },
    unpoweredGridRemoval: { type: Boolean, require: true },
    largeGridAllowed: { type: Boolean, required: true },
    smallGridAllowed: { type: Boolean, required: true },
    blockThreshold: { type: String, required: true },
    cleanUnverifiedPlayerGrids: { type: Boolean, require: true }
});
// End Main Schema

const model = mongoose.model("hooversettings", hooverSchema);

module.exports = model;