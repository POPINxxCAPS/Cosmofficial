const hooverRemover = require('../functions_server/hooverRemover');
const hooverUpdater = require('../functions_server/hooverUpdater');
const discordServerSettings = require('../models/discordServerSettingsSchema');

module.exports = (client) => {
    setInterval(async () => {
        let guildIDs = await client.guilds.cache.map(guild => guild.id);
        guildIDs.forEach(async guildID => {
            let settings = await discordServerSettings.findOne({
                guildID: guildID
            })
            if(settings === null) return;
            hooverRemover(guildID, settings, client)
            hooverUpdater(guildID, settings, client)
        })
    }, 150000)
}