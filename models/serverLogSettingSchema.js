const mongoose = require("mongoose");
const singleSetting = new mongoose.Schema({
    name: { type: String, require: true },
    value: { type: String, require: true },
    description: { type: String, require: true },
})
// Main Schema
const serverLogSettingSchema = new mongoose.Schema({
    guildID: { type: String, require: true, index: true, unique: true },
    settings: [singleSetting]
});
// End Main Schema

const model = mongoose.model("serverlogsettings", serverLogSettingSchema);

module.exports = model;