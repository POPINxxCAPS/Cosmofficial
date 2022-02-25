const remoteConfigModel = require('../models/remoteConfigSchema');
const discordServerSettingsModel = require('../models/discordServerSettngsSchema');
const ms = require('ms')

// Query Functions
const statusQuery = require('../functions_server/statusQuery');
const gridQuery = require('../functions_server/gridQuery');
const playerQuery = require('../functions_server/playerQuery');
const characterQuery = require('../functions_server/characterQuery');
const chatQuery = require('../functions_server/chatQuery');
const floatingObjQuery = require('../functions_server/floatingObjectQuery');
const logVoxels = require('../functions_server/logVoxels');

const {
    demotePlayer,
    banPlayer,
    kickPlayer,
    promotePlayer
} = require('../lib/admin');
const {
    filterBySearch
} = require('../lib/modifiers');
const sessionPath = '/v1/session';
const serverPath = '/v1/server';


const axios = require('axios');
const crypto = require('crypto');
const JSONBI = require('json-bigint')({
    storeAsString: true,
    useNativeBigInt: true
});
const querystring = require('querystring');

module.exports = async (client) => {
    let guildIDs = await client.guilds.cache.map(guild => guild.id);
    
    // Interval to check for new discords
    setInterval(async () => {
        guildIDs = await client.guilds.cache.map(guild => guild.id);
    }, 300000)
    // Status Query
    setInterval(async () => {
        guildIDs.forEach(async guildID => {
            if (guildID === '853247020567101440') return;
            let settings = await discordServerSettingsModel.findOne({
                guildID: guildID
            });
            if (settings === null) {
                settings = await discordServerSettingsModel.create({
                    guildID: guildID,
                    serverLogChannel: 'None',
                    hotzoneChannel: 'None',
                    chatRelayChannel: 'None',
                    botCommandChannel: 'None'
                })
            }

            let config = await remoteConfigModel.findOne({
                guildID: guildID
            })
            if (config === null) return;
            // Update server status
            statusQuery(guildID, config, settings, client)
        })
    }, 15000)

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

    // Chat Query
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

            // Log Chat
            chatQuery(guildID, config, settings, client);
        })
    }, 90000)

    // Player Query
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

            // Log Players
            playerQuery(guildID, config, settings, client);
        })
    }, 60000)

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

    // Asteroid Query (Modified Voxels)
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
            let req = {
                guildID: guildID,
                config: config,
                settings: settings
            }
            await logVoxels(req); // Just using await to ensure it's only ran once (weird bug)
        })
    }, 600000) // Only runs every 10 minutes because it crashes queries if done too often.
}