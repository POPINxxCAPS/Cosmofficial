const mongoose = require("mongoose");

// Nearby Schema
const npcSchema = new mongoose.Schema({
    displayName: { type: String },
    ownerDisplayName: { type: String }, 
    entityID: { type: String }, 
})
const friendlyGridSchema = new mongoose.Schema({
    displayName: { type: String },
    ownerDisplayName: { type: String }, 
    entityID: { type: String },
    factionTag: { type: String } 
})
const enemyGridSchema = new mongoose.Schema({
    displayName: { type: String },
    ownerDisplayName: { type: String }, 
    entityID: { type: String },
    factionTag: { type: String } 
})
const friendlyCharacterSchema = new mongoose.Schema({
    displayName: { type: String },
    entityID: { type: String },
    factionTag: { type: String } 
})
const enemyCharacterSchema = new mongoose.Schema({
    displayName: { type: String },
    entityID: { type: String },
    factionTag: { type: String } 
})

const nearbySchema = new mongoose.Schema({
    npcs: [npcSchema],
    friendlyGrids: [friendlyGridSchema],
    enemyGrids: [enemyGridSchema],
    friendlyCharacters: [friendlyCharacterSchema],
    enemyCharacters: [enemyCharacterSchema]
})
// Main Schema
const gridsSchema = new mongoose.Schema({
    guildID: { type: String, require: true, index: true },
    displayName: { type: String, require: true, index: true },
    entityID: { type: String, require: true, index: true },
    gridSize: { type: String, require: true, index: true },
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
    factionTag: { type: String, index: true },
    queuedForDeletion: { type: Boolean },
    deletionTime: { type: String },
    deletionReason: { type: String },
    isNPC: { type: Boolean },
    nearby: [nearbySchema]
});
// End Main Schema

const model = mongoose.model("grids", gridsSchema);

module.exports = model;