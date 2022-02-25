const remoteConfigModel = require('../models/remoteConfigSchema');
const discordServerSettingsModel = require('../models/discordServerSettngsSchema');

// Query Functions
const logStatus = require('../functions_server/logStatus');
const gridQuery = require('../functions_server/gridQuery');
const logPlayers = require('../functions_server/logPlayers');
const characterQuery = require('../functions_server/characterQuery');
const logChat = require('../functions_server/logChat');
const floatingObjQuery = require('../functions_server/floatingObjectQuery');
const logVoxels = require('../functions_server/logVoxels');

module.exports = async (client) => {
    let guildIDs = await client.guilds.cache.map(guild => guild.id);
    
    // Interval to check for new discords
    setInterval(async () => {
        guildIDs = await client.guilds.cache.map(guild => guild.id);
    }, 300000)

    // Grid Query
    setInterval(async () => {
        guildIDs.forEach(async guildID => {
            if (guildID === '853247020567101440') return;
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

            let config = await remoteConfigModel.findOne({
                guildID: guildID
            })
            if (config === null || settings === null) return;

            // Log Grids
            gridQuery(guildID, config, settings, client);
        })
    }, 90000)

    // Character Query
    setInterval(async () => {
        guildIDs.forEach(async guildID => {
            if (guildID === '853247020567101440') return;
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

            let config = await remoteConfigModel.findOne({
                guildID: guildID
            })
            if (config === null || settings === null) return;

            // Log characters
            characterQuery(guildID, config, settings);
        })
    }, 15000)

    // Floating Object Query
    setInterval(async () => {
        guildIDs.forEach(async guildID => {
            if (guildID === '853247020567101440') return;
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

            let config = await remoteConfigModel.findOne({
                guildID: guildID
            })
            if (config === null || settings === null) return;

            // Log Floating Objects
            floatingObjQuery(guildID, config, settings);
        })
    }, 45000)

    // Query Interval
    setInterval(async () => {
        guildIDs.forEach(async guildID => {
            if (guildID === '853247020567101440') return; // Ignore Cosmofficial Discord
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

            let config = await remoteConfigModel.findOne({
                guildID: guildID
            })
            if (config === null || settings === null) return;
            let req = {
                guildID: guildID,
                config: config,
                settings: settings,
                client: client
            }
            await logStatus(req); // Do this first so the rest know if they even need to do anything.
            logPlayers(req);
            logChat(req);
            //logVoxels(req); Disabled due to memory error
        })
    }, 15500) // Timers are now handled in each query seperately, so this is no issue.
}