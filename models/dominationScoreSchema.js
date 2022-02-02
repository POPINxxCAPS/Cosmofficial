const mongoose = require("mongoose");
 
const dominationScoreSchema = new mongoose.Schema({
    guildID: { type: String, require: true, index: true },
    factionTag: { type: String, require: true },
    score: { type: String, require: true }
});
// End Main Schema
 
const model = mongoose.model("dominationScores", dominationScoreSchema);
 
module.exports = model;