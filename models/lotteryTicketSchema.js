const mongoose = require("mongoose");
// Main Schema
const lotteryTicketSchema = new mongoose.Schema({
    guildID: { type: String, require: true },
    userID: { type: String, require: true},
    num1: { type: String, require: true },
    num2: { type: String, require: true },
    num3: { type: String, require: true },
});
// End Main Schema

const model = mongoose.model("lotteryTickets", lotteryTicketSchema);

module.exports = model;