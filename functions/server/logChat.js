const chatModel = require('../../models/chatSchema');
const playerModel = require('../../models/playerSchema');
const queryChat = require('../execution/queryChat');
const timerFunction = require('../database/timerFunction');
const makeChannelSettingVar = require('../misc/makeChannelSettingVar');
let loggedChats = [];

module.exports = async (req) => {
    const guildID = req.guildID;
    const config = req.config;
    const settings = req.settings;
    const client = req.client;
    const statusDoc = req.statusDoc; // Confirm server is being reported as online before attempting query
    if (statusDoc === null || statusDoc.serverOnline === false || statusDoc.serverOnline === undefined) return null;
    req.expirationInSeconds = (req.gridQueryDelay * 0.75) / 1000 || 30;
    if (req.expirationInSeconds < 30) req.expirationInSeconds = 30;
    req.name = 'logChat'
    const timerCheck = await timerFunction(req)
    if (timerCheck === true) return; // If there is a timer, cancel.

    let chats = await queryChat(config)
    if (chats === undefined) return;

    let chatHistory = await chatModel.findOne({
        guildID: guildID
    })
    if (chatHistory === null || chatHistory === [] || chatHistory === undefined || !chatHistory) {
        chatHistory = await chatModel.create({
            guildID: guildID,
            chatHistory: [],
        })
    }

    await chats.forEach(async singleChat => { // I know forEach isn't async friendly, using it anyway lmao.
        if (loggedChats.includes(singleChat)) {} else {
            let msTimestamp = Date.now();
            let exists = false;
            singleChat.msTimestamp = msTimestamp
            for (let a = 0; a < chatHistory.chatHistory.length; a++) {
                if (chatHistory.chatHistory[a].timestamp === singleChat.Timestamp) {
                    exists = true;
                }
            }
            if (exists === false) {
                console.log(singleChat)
                chatHistory.chatHistory.push({
                    steamID: singleChat.SteamID,
                    displayName: singleChat.DisplayName,
                    content: singleChat.Content,
                    timestamp: singleChat.Timestamp,
                    msTimestamp: msTimestamp
                })
                let factionTag = ''
                if (singleChat.DisplayName !== 'Good.bot') {
                    let playerDoc = await playerModel.findOne({
                        guildID: guildID,
                        displayName: singleChat.DisplayName
                    })
                    if (playerDoc !== null) {
                        factionTag = `[${playerDoc.factionTag}] `
                    }
                }


                const channelSettings = await makeChannelSettingVar(guildID, settings)
                const channel = client.channels.cache.get(channelSettings.chatRelay);
                if (channel !== null && channel !== undefined) {
                    const obscured = 'Message obscured due to GPS';
                    if (singleChat.Content.includes('GPS') || singleChat.Content.includes('Gps')) {
                        channel.send(`**${factionTag} ${singleChat.DisplayName}:** ${obscured}`);
                    } else {
                        channel.send(`**${factionTag} ${singleChat.DisplayName}:** ${singleChat.Content}`)
                    }

                }
            }
        }
    })
    chatHistory.save()
    return;
}