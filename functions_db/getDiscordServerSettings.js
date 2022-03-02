const discordServerSettingsModel = require('../models/discordServerSettngsSchema');

module.exports = async (guildID) => {
    let settings = await discordServerSettingsModel.findOne({
        guildID: guildID
    });
    if (settings === null) {
        try {
        settings = await discordServerSettingsModel.create({
            guildID: guildID,
            serverLogChannel: 'None',
            hotzoneChannel: 'None',
            chatRelayChannel: 'None',
            botCommandChannel: 'None'
        })
        } catch(err) {}
    }
    return settings
}