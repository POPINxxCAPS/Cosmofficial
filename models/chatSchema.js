const mongoose = require("mongoose");
 
const singleChatSchema = new mongoose.Schema({
    steamID: { type: String, require: true },
    displayName: { type: String },
    content: { type: String },
    timestamp: { type: String },
    msTimestamp: { type: String }
});

const mainChatSchema = new mongoose.Schema({
    guildID: { type: String, require: true },
    chatHistory: [singleChatSchema]
})
// End Main Schema
 
const model = mongoose.model("chatHistories", mainChatSchema);
 
module.exports = model;

