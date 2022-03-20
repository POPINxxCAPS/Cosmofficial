const mongoose = require("mongoose");
 
const populationSchema = new mongoose.Schema({
    playerCount: { type: String, require: true },
    timestamp: { type: String, require: true}
})

const simSpeedSchema = new mongoose.Schema({
    simSpeed: { type: String, require: true },
    timestamp: { type: String, require: true}
})

const statusSchema = new mongoose.Schema({
    guildID: { type: String, require: true },
    game: { type: String, require: true },
    isReady: { type: Boolean, require: true },
    pirateUsedPCU: { type: String, require: true },
    players: { type: String, require: true},
    serverID: { type: String, require: true },
    serverName: { type: String, require: true, unique: true, index: true },
    simSpeed: { type: String, require: true },
    simCPULoad: { type: String, require: true},
    usedPCU: { type: String, require: true },
    version: { type: String, require: true },
    worldName: { type: String, require: true },
    lastUpdated: { type: String, require: true },
    nextPopLog: { type: String, require: true},
    serverOnline: { type: Boolean },
    inviteLink: { type: String },
    populationLog: [populationSchema],
    simSpeedLog: [simSpeedSchema],
});
// End Main Schema
 
const model = mongoose.model("status", statusSchema);
 
module.exports = model;