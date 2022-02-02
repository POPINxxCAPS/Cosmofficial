const mongoose = require("mongoose");
const singleSetting = new mongoose.Schema({
    name: { type: String, require: true },
    value: { type: String, require: true },
    description: { type: String, require: true },
    ecoRequired: { type: Boolean, require: true },
    adminRequired: { type: Boolean, require: true },
    mappingRequired: { type: Boolean, require: true },
    eventRequired: { type: Boolean, required: true }
})
// Main Schema
const ecoSettingSchema = new mongoose.Schema({
    guildID: { type: String, require: true, index: true, unique: true },
    settings: [singleSetting]
});
// End Main Schema

const model = mongoose.model("ecosettings", ecoSettingSchema);

module.exports = model;