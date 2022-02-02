const mongoose = require("mongoose");
// Main Schema
const commandPriceSchema = new mongoose.Schema({
    guildID: { type: String, require: true },
    command: { type: String, require: true },
    price: { type: String, require: true }
});
// End Main Schema

const model = mongoose.model("commandPrices", commandPriceSchema);

module.exports = model;