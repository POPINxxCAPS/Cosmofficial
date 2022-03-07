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
const verificationModel = require('../models/verificationSchema');
const allianceModel = require('../models/allianceSchema');
const gridModel = require('../models/gridSchema');
const characterModel = require('../models/characterSchema');

let fullGridDocsCache = []; // Caching all grid docs so it doesn't have to keep downloading them.
module.exports = async (client) => {
    let guildIDs = await client.guilds.cache.map(guild => guild.id);
    let verDocs = await verificationModel.find({});

    // Interval to check for new discords and update verifications
    setInterval(async () => {
        guildIDs = await client.guilds.cache.map(guild => guild.id);
        verDocs = await verificationModel.find({});
    }, 600000)

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
        for (let g = 0; g < guildIDs.length; g++) { // Changed to for instead of forEach to avoid heap error
            if (queryIsRunning === true) break; // Cancel if there's already another server being queried.
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
            const allianceDocs = await allianceModel.find({
                guildID: guildID
            })
            const characterDocs = await characterModel.find({
                guildID: guildID
            })
            console.log(`Doing queries for guild ID ${guildID}`)

            let gridDocsCache = fullGridDocsCache.find(cache => cache.guildID === guildID);
            if(gridDocsCache === undefined) {
                gridDocsCache = await gridModel.find({
                    guildID: guildID
                })
            } else {
                console.log(gridDocsCache.guildID) // Once cached, debug to see if it's undefined?
                gridDocsCache = gridDocsCache.gridDocsCache;
            }

            // Start querys
            const req = {
                guildID: guildID,
                config: config,
                settings: settings,
                client: client,
                verDocs: verDocs,
                allianceCache: allianceDocs,
                gridDocsCache: gridDocsCache,
                characterDocsCache: characterDocs
            }
            logStatus(req); // Specific Ordering. Do not await this one because it needs to be able to fail without causing issues for a var update
            await logChat(req);
            await logPlayers(req);
            const newGridDocsCache = await gridQuery(req); // The last one needs await to ensure it's only running for one server at a time (performance reasons)
            if(newGridDocsCache === null || newGridDocsCache === undefined) {
                queryIsRunning = false;
                continue;
            }
            let test = fullGridDocsCache.find(cache => cache.guildID === guildID);
            if(test === undefined) { // If grid docs haven't been cached yet
                fullGridDocsCache.push({
                    guildID: guildID,
                    gridDocsCache: newGridDocsCache
                })
            } else { // If they have, find index and replace the cache with updated version
                let index = fullGridDocsCache.indexOf(test);
                
                console.log(`Cache updated. GuildID: ${guildID}, New Length: ${newGridDocsCache.length}, Old Length: ${gridDocsCache.length}`)
                fullGridDocsCache[index] = {
                    guildID: guildID,
                    gridDocsCache: newGridDocsCache
                }
            }
            
            

            // However, until this one is fully recoded I cannot use await or it makes the bot run 40x slower.
            //logVoxels(req); Disabled due to memory error
            console.log(`Finished queries for guild ID ${guildID}`)
            queryIsRunning = false;
            // Running test before finishing the noob caching
        }
    }, 15000) //  Main timers are now handled in each query seperately. This just restarts the queries when the last server finishes.
}