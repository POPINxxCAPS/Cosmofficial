const mongoose = require("mongoose");

const factionTagSchema = new mongoose.Schema({
    factionTag: { type: String, require: true }
})
// Main Schema
const allianceSchema = new mongoose.Schema({
    guildID: { type: String, require: true },
    allianceName: { type: String, require: true },
    allianceLeaderID: { type: String, require: true },
    allianceAdminIDs: [factionTagSchema],
    factionTags: [factionTagSchema],
    invitedFactionTags: [factionTagSchema],
    alliancePoints: { type: String, require: true }
});
// End Main Schema

const model = mongoose.model("alliances", allianceSchema);

module.exports = model;