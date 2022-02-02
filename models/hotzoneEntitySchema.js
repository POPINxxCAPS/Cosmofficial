const mongoose = require("mongoose");
// Main Schema
const hotzoneEntitySchema = new mongoose.Schema({
    guildID: { type: String, require: true },
    category: { type: String, require: true },
    displayName: { type: String, require: true },
    entityID: { type: String, require: true, unique: true, index: true },
    factionTag: { type: String, require: true },
    x: { type: String, require: true },
    y: { type: String, require: true },
    z: { type: String, require: true },
    expirationTime: { type: String, require: true },
    entryTime: { type: String, require: true }
});
// End Main Schema

const model = mongoose.model("hotzoneEntities", hotzoneEntitySchema);

module.exports = model;