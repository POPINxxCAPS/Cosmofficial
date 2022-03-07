const mongoose = require("mongoose");
 
const configSchema = new mongoose.Schema({
    guildID: { type: String, require: true, unique: true, index: true },
    serverOnline: { type: Boolean },
    serverLogChannel: { type: String },
    hotzoneChannel: { type: String },
    chatRelayChannel: { type: String },
    botCommandChannel: { type: String }
});
// End Main Schema
 
const model = mongoose.model("discordServerSettings", configSchema);
 
module.exports = model;