const mongoose = require("mongoose");
// Main Schema
const botStatSchema = new mongoose.Schema({
    name: { type: String },
    value: { type: String }
});
// End Main Schema

const model = mongoose.model("botstats", botStatSchema);

module.exports = model;