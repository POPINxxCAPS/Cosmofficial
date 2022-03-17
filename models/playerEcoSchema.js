const mongoose = require("mongoose");

// Sub Schema
const statistic = new mongoose.Schema({
    name: { type: String, require: true },
    value: { type: String, require: true }
})
// Main Schema
let playerEcoSchema = new mongoose.Schema({
    guildID: { type: String, require: true, index: true },
    userID: { type: String, require: true, index: true },
    currency: { type: String, require: true, index: true },
    vault: { type: String, require: true },
    statistics: [statistic]
});
// End Main Schema

const model = mongoose.model("playerEcos", playerEcoSchema);

module.exports = model;