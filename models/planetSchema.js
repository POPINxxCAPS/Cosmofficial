const mongoose = require("mongoose");
// Main Schema
const planetSchema = new mongoose.Schema({
    name: { type: String },
    x: { type: String },
    y: { type: String },
    z: { type: String }
});
// End Main Schema

const model = mongoose.model("planets", planetSchema);

module.exports = model;