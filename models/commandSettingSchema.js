const mongoose = require("mongoose");

const commandSettingSchema = new mongoose.Schema({
    commandName: { type: String },
    setting: { type: String },
    value: { type: String }
})
const model = mongoose.model("commandSettings", commandSettingSchema);
 
module.exports = model;