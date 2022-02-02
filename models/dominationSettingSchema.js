const mongoose = require("mongoose");
const objectiveSchema = new mongoose.Schema({
    name: { type: String, require: true },
    enabled: { type: Boolean, require: true },
    x: { type: String, require: true },
    y: { type: String, require: true },
    z: { type: String, require: true },
    pointRadius: { type: String, require: true },
    capturePercentage: { type: String, require: true },
    capturedBy: { type: String, require: true },
})
// Main Schema
const dominationSettingSchema = new mongoose.Schema({
    guildID: { type: String, require: true },
    channelID: { type: String },
    enabled: { type: Boolean, require: true },
    newGameDelay: { type: String, require: true },
    gameEndTime: { type: String, require: true },
    rewardPerPoint: { type: String, require: true },
    winReward: { type: String, require: true },
    matchTime: { type: String, require: true},
    pointLimit: { type: String, require: true},
    captureTime: { type: String, require: true},
    objectives: [objectiveSchema]
});
// End Main Schema

const model = mongoose.model("dominationsettings", dominationSettingSchema);

module.exports = model;