// Settings stuff
const getAllSettings = require('../functions_db/getAllSettings');
const makeConfigVar = require('../functions_misc/makeConfigVar');
const makeEcoSettingVar = require('../functions_misc/makeEcoSettingVar');

// Query Functions
const logStatus = require('../functions_server/logStatus');
const logGrids = require('../functions_server/logGrids');
const logPlayers = require('../functions_server/logPlayers');
const logCharacters = require('../functions_server/logCharacters');
const logChat = require('../functions_server/logChat');
const logFloatingObjs = require('../functions_server/logFloatingObjs');
const logVoxels = require('../functions_server/logVoxels');
const lotteryHandler = require('../handlers/lotteryHandler');
const verificationModel = require('../models/verificationSchema');
const allianceModel = require('../models/allianceSchema');
const gridModel = require('../models/gridSchema');
const characterModel = require('../models/characterSchema');
const statusModel = require('../models/statusSchema');

let fullGridDocsCache = []; // Caching all grid docs so it doesn't have to keep downloading them.
module.exports = async (client) => {
    let guildIDs = await client.guilds.cache.map(guild => guild.id);
    let verDocs = await verificationModel.find({});

    // Interval to check for new discords and update verifications
    setInterval(async () => {
        guildIDs = await client.guilds.cache.map(guild => guild.id);
        verDocs = await verificationModel.find({});
    }, 600000)

    // Query Interval
    let queryIsRunning = false;
    setInterval(async () => {
        for (let g = 0; g < guildIDs.length; g++) {
            if (queryIsRunning === true) break; // Cancel if there's already another server being queried.
            queryIsRunning = true;
            const guildID = guildIDs[g];
            if (guildID === '853247020567101440') {
                queryIsRunning = false;
                continue;
            }; // Ignore Cosmofficial Discord

            // Get server status document
            const statusDoc = await statusModel.findOne({
                guildID: guildID
            })

            // Pull all settings
            const settings = await getAllSettings(guildID);
            // Pull config from settings
            const config = await makeConfigVar(guildID, settings);
            // Pull Economy Settings
            const ecoSettings = await makeEcoSettingVar(guildID, settings);
            if (config === null || config.ip === 'Not Set' || config.port === 'Not Set' || config.secret === 'Not Set') { // Double check
                queryIsRunning = false;
                continue;
            } // Cancel if server isn't configured
            const allianceDocs = await allianceModel.find({
                guildID: guildID
            })
            const characterDocs = await characterModel.find({
                guildID: guildID
            })
            console.log(`Doing queries for guild ID ${guildID}`)

            let gridDocsCache = fullGridDocsCache.find(cache => cache.guildID === guildID) || await gridModel.find({
                guildID: guildID
            })

            let gridQueryDelay = gridDocsCache.gridQueryRunTime * 3 || 60000; // Setting delay to 4x the runtime of an individual server's grid query speed


            if (gridDocsCache !== undefined) {
                gridDocsCache = gridDocsCache.gridDocsCache || gridDocsCache;
                if (gridQueryDelay < 60000) {
                    gridQueryDelay = 60000 // Ensure it is no less than 60 seconds to avoid crashing the remote API
                }
                console.log(`New Grid Query Delay: ${gridQueryDelay / 1000}s`)
            }

            // Start querys
            const req = {
                guildID: guildID,
                config: config,
                statusDoc: statusDoc,
                settings: settings,
                ecoSettings: ecoSettings,
                client: client,
                verDocs: verDocs,
                allianceCache: allianceDocs,
                gridDocsCache: gridDocsCache,
                gridQueryDelay: gridQueryDelay,
                characterDocsCache: characterDocs
            }

            await lotteryHandler(req);
            await logStatus(req); // Specific Ordering
            await logFloatingObjs(req); // This doesn't need anything special
            await logChat(req);
            await logPlayers(req);
            await logCharacters(req);
            const gridQueryResponse = await logGrids(req); // The last one needs await to ensure it's only running for one server at a time (performance reasons)
            if (gridQueryResponse === null || gridQueryResponse === undefined) {
                queryIsRunning = false;
                continue;
            }
            const newGridDocsCache = gridQueryResponse.gridDocsCache;
            const gridQueryRunTime = gridQueryResponse.runTime;
            console.log(gridQueryRunTime)
            let test = fullGridDocsCache.find(cache => cache.guildID === guildID);
            if (test === undefined) { // If grid docs haven't been cached yet
                fullGridDocsCache.push({
                    guildID: guildID,
                    gridDocsCache: newGridDocsCache,
                    gridQueryRunTime: gridQueryRunTime
                })
            } else { // If they have, find index and replace the cache with updated version
                let index = fullGridDocsCache.indexOf(test);
                fullGridDocsCache[index] = {
                    guildID: guildID,
                    gridDocsCache: newGridDocsCache,
                    gridQueryRunTime: gridQueryRunTime
                }
            }

            //logVoxels(req); Disabled due to memory error
            console.log(`Finished queries for guild ID ${guildID}`)
            queryIsRunning = false;
            // Running test before finishing the noob caching
        }
    }, 15000) //  Main timers are now handled in each query seperately. This just restarts the queries when the last server finishes.
}