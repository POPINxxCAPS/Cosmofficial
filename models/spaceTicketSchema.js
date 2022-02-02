const mongoose = require("mongoose");
// Main Schema
const spaceTicketSchema = new mongoose.Schema({
    factionTag: { type: String, require: true },
    expirationTime: { type: String, require: true },
});
// End Main Schema

const model = mongoose.model("spacetickets", spaceTicketSchema);

module.exports = model;