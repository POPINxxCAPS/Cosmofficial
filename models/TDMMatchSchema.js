const mongoose = require("mongoose");

const teamOneSchema = new mongoose.Schema({
    userID: { type: String, require: true },
    username: { type: String, require: true},
    gamertag: { type: String, require: true }
})
const teamTwoSchema = new mongoose.Schema({
    userID: { type: String, require: true },
    username: { type: String, require: true },
    gamertag: { type: String, require: true }
})
// Main Schema
const TDMMatchSchema = new mongoose.Schema({
  teamOne: [teamOneSchema],
  teamTwo: [teamTwoSchema],
  matchStartTime: { type: String, require: true },
  matchEndTime: { type: String, require: true },
  scoreLimit: { type: Number, require: true },
  teamOneScore: { type: Number, require: true },
  teamTwoScore: { type: Number, require: true },
  matchStarted: { type: Boolean, require: true }
});

// End Main Schema

const model = mongoose.model("tdmMatch", TDMMatchSchema);

module.exports = model;