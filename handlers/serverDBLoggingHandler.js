// Database Model Stuff
const remoteConfigModel = require('../models/remoteConfigSchema');
const getDiscordServerSettings = require('../functions_db/getDiscordServerSettings');

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

    // Character Query
    setInterval(async () => {
        guildIDs.forEach(async guildID => {
            if (guildID === '853247020567101440') return;
            let settings = await getDiscordServerSettings(guildID);

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
            let settings = await getDiscordServerSettings(guildID);

            let config = await remoteConfigModel.findOne({
                guildID: guildID
            })
            if (config === null || settings === null) return;

            // Log Floating Objects
            floatingObjQuery(guildID, config, settings);
        })
    }, 45000)

    // Query Interval
    let queryIsRunning = false;
    setInterval(async () => {
        for(let g = 0; g < guildIDs.length; g++) { // Changed to for instead of forEach to avoid heap error
            if(queryIsRunning === true) break; // Cancel if there's already another server being queried.
            queryIsRunning = true;
            const guildID = guildIDs[g];
            if (guildID === '853247020567101440') {
                queryIsRunning = false;
                continue;
            }; // Ignore Cosmofficial Discord
            // Discord Channel Settings (needs COMPLETE remodel) - This is just prep
            let settings = await getDiscordServerSettings(guildID);

            // Get config
            let config = await remoteConfigModel.findOne({
                guildID: guildID
            })
            if (config === null || settings === null) {
                queryIsRunning = false;
                continue;
            }
            console.log(`Doing queries for guild ID ${guildID}`)

            // Start querys
            const req = {
                guildID: guildID,
                config: config,
                settings: settings,
                client: client
            }
            await logStatus(req); // Specific Ordering.
            await logChat(req);
            await logPlayers(req);
            await gridQuery(req); // The last one needs await to ensure it's only running for one server at a time (performance reasons)
            //logVoxels(req); Disabled due to memory error
            console.log(`Finished queries for guild ID ${guildID}`)
            queryIsRunning = false;
        }
    }, 10000) //  Main timers are now handled in each query seperately.
}