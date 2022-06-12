const getAllSettings = require("../database/getAllSettings");

module.exports = async (guildID, settings) => {
    if(settings === undefined) {
        settings = await getAllSettings(guildID);
    }
    const channelSettings = settings.find(set => set.name === 'channels')
    let channel = {};
    try { // .find() Causes crashes, so I need to do it this way.
        channel.commands = channelSettings.settings.find(set => set.setting === 'commands').value;
        channel.chatRelay = channelSettings.settings.find(set => set.setting === 'chatrelay').value;
        channel.hotzone = channelSettings.settings.find(set => set.setting === 'hotzone').value;
        channel.domination = channelSettings.settings.find(set => set.setting === 'domination').value;
        channel.lottery = channelSettings.settings.find(set => set.setting === 'lottery').value;
        channel.hooverLog = channelSettings.settings.find(set => set.setting === 'hooverlog').value;
    } catch (err) {
        console.log(`There was an error making the channels var for guildID ${guildID}.`)
        return null;
    }
    return channel;
}