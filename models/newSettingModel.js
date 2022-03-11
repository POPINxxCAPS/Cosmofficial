const mongoose = require("mongoose");
// Main Schema
const newSettingSchema = new mongoose.Schema({
    guildID: { type: String },
    displayName: { type: String },
    category: { type: String },
    setting: { type: String },
    description: { type: String },
    value: { type: String },
    valueType: { type: String }
});
// End Main Schema

const model = mongoose.model("newSettings", newSettingSchema);

module.exports = model;