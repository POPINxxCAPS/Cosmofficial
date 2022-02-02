const mongoose = require("mongoose");
// Main Schema
const floatingObjectSchema = new mongoose.Schema({
    guildID: { type: String },
    name: { type: String },
    mass: { type: String },
    distanceToPlayer: { type: String },
    expirationTime: { type: String },
    entityID: { type: String },
    x: { type: String },
    y: { type: String },
    z: { type: String }
});
// End Main Schema

const model = mongoose.model("floatingObjects", floatingObjectSchema);

module.exports = model;