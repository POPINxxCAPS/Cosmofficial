const mongoose = require("mongoose");
// Main Schema
const asteroidSchema = new mongoose.Schema({
    guildID: { type: String },
    entityID: { type: String },
    x: { type: String },
    y: { type: String },
    z: { type: String },
    expirationTime: { type: String }
});
// End Main Schema

const model = mongoose.model("asteroids", asteroidSchema);

module.exports = model;