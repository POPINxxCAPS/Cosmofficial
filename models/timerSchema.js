const mongoose = require("mongoose");
// Main Schema
const timerSchema = new mongoose.Schema({
    guildID: {
        type: String,
        require: true
    },
    name: {
        type: String,
        require: true
    },
    expirationTime: {
        type: String,
        require: true
    },
});
// End Main Schema

const model = mongoose.model("timer", timerSchema);

module.exports = model;