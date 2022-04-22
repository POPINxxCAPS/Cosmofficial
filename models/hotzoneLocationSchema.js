const mongoose = require("mongoose");
// Main Schema
const hotzoneSchema = new mongoose.Schema({
    guildID: { type: String, require: true, unique: true },
    x: { type: String, require: true },
    y: { type: String, require: true },
    z: { type: String, require: true },
    expirationTime: { type: String, require: true }
});
// End Main Schema

const model = mongoose.model("hotzones", hotzoneSchema);

module.exports = model;