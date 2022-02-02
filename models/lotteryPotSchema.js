const mongoose = require("mongoose");
// Main Schema
const lotteryPotSchema = new mongoose.Schema({
    guildID: { type: String, require: true, unique: true },
    potAmount: { type: String, require: true },
    winningNum1: { type: String, require: true },
    winningNum2: { type: String, require: true },
    winningNum3: { type: String, require: true },
    drawTime: { type: String, require: true }
});
// End Main Schema

const model = mongoose.model("lotteryPot", lotteryPotSchema);

module.exports = model;