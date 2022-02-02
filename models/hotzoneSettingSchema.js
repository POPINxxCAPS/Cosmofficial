const mongoose = require("mongoose");
const presetLocationSchema = new mongoose.Schema({
    x: { type: String, require: true },
    y: { type: String, require: true },
    z: { type: String, require: true }
})
// Main Schema
const hotzoneSettingSchema = new mongoose.Schema({
    guildID: { type: String, require: true, unique: true },
    hotzoneEnabled: { type: Boolean, require: true },
    hotzoneInterval: { type: String, require: true },
    hotzoneTimer: { type: String, require: true },
    hotzoneRewardPerSec: { type: String, require: true },
    hotzoneEndBonus: { type: String, require: true },
    hotzoneRadius: { type: String, require: true },
    hotzoneSpawnRange: { type: String, require: true },
    presetZones: { type: Boolean, require: true },
    presetLocations: [presetLocationSchema]
});
// End Main Schema

const model = mongoose.model("hotzonesettings", hotzoneSettingSchema);

module.exports = model;