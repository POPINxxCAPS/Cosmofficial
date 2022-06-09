const mongoose = require("mongoose");

// Main Schema
const NPCGridsSchema = new mongoose.Schema({
    guildID: { type: String, require: true, index: true },
    displayName: { type: String, require: true, index: true },
    entityID: { type: String, require: true, index: true },
    gridSize: { type: String, require: true },
    blocksCount: { type: Number, require: true },
    mass: { type: Number, require: true },
    positionX: { type: String, require: true },
    positionY: { type: String, require: true },
    positionZ: { type: String, require: true },
    linearSpeed: { type: String, require: true },
    distanceToPlayer: { type: String, require: true },
    ownerSteamID: { type: String, require: true },
    ownerDisplayName: { type: String, require: true, index: true },
    isPowered: { type: Boolean, require: true },
    PCU: { type: Number, require: true },
    expirationTime: { type: String },
});
// End Main Schema

const model = mongoose.model("npcGrids", NPCGridsSchema);

module.exports = model;