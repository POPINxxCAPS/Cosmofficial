const mongoose = require("mongoose");
 
const configSchema = new mongoose.Schema({
    baseURL: { type: String, require: true },
    port: { type: String, require: true },
    prefix: { type: String, require: true },
    secret: { type: String, require: true },
    guildID: { type: String, require: true, index: true },
});
// End Main Schema
 
const model = mongoose.model("remoteconfig", configSchema);
 
module.exports = model;