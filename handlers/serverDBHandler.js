// Settings Stuff
const getAllSettings = require('../functions/database/getAllSettings');
const makeConfigVar = require('../functions/misc/makeConfigVar');
const makeEcoSettingVar = require('../functions/misc/makeEcoSettingVar');

// Hoover Functions
const updateHoover = require('../functions/hoover/updateHoover')
const executeHoover = require('../functions/hoover/executeHoover')

// Query Functions
const logStatus = require('../functions/server/logStatus');
const logGrids = require('../functions/server/logGrids');
const logPlayers = require('../functions/server/logPlayers');
const logCharacters = require('../functions/server/logCharacters');
const logChat = require('../functions/server/logChat');
const logFloatingObjs = require('../functions/server/logFloatingObjs');
const logVoxels = require('../functions/server/logVoxels');
const lotteryHandler = require('../handlers/lotteryHandler');
const hotzoneHandler = require('../functions/hotzone/hotzoneHandler');

// Database Stuff
const verificationModel = require('../models/verificationSchema');
const allianceModel = require('../models/allianceSchema');
const gridModel = require('../models/gridSchema');
const characterModel = require('../models/characterSchema');
const statusModel = require('../models/statusSchema');

// Debug stuff
const ms = require('ms');

// Changing this to use a discord collection (just learned about them)
module.exports = async (client, discord) => {
    let guildIDs = await client.guilds.cache.map(guild => guild.id);
    guildIDs.push('1');
    let verDocs = await verificationModel.find({});

    // Interval to check for new discords and update verifications
    setInterval(async () => {
        guildIDs = await client.guilds.cache.map(guild => guild.id);
        guildIDs.push('1');
        verDocs = await verificationModel.find({});
    }, 180000)

    // Query Interval
    let queryIsRunning = false;
    setInterval(async () => {
        for (let g = 0; g < guildIDs.length; g++) {
            if (queryIsRunning === true) break; // Cancel if there's already another server being queried.
            queryIsRunning = true;
            let guildID = guildIDs[g];
            if (guildID === '853247020567101440') {
                queryIsRunning = false;
                continue;
            }; // Ignore Cosmofficial Discord
            const execution_time = Date.now();


            // Get server status document
            const statusDoc = await statusModel.findOne({
                guildID: guildID
            })
            if(statusDoc !== null) {
                if(statusDoc.nextConnectAttempt > execution_time) {
                    queryIsRunning = false;
                    continue;   
                }
                if(statusDoc.failedConnects >= 100) {
                    queryIsRunning = false;
                    continue;   
                }
            }


            const gridDocsCache = client.gridDocCache.get(guildID) || await gridModel.find({
                guildID: guildID
            })
            if(client.gridDocCache.get(guildID) === undefined) client.gridDocCache.set(guildID, gridDocsCache);
            const lastGridDocsCache = client.lastGridDocCache.get(guildID);
            const queryDelay = client.queryDelays.get(guildID) || 30;

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

            // Start querys
            let req = {
                guildID: guildID,
                config: config,
                statusDoc: statusDoc,
                settings: settings,
                ecoSettings: ecoSettings,
                client: client,
                discord: discord,
                verDocs: verDocs,
                allianceCache: allianceDocs,
                gridDocsCache: gridDocsCache,
                gridQueryDelay: queryDelay,
                characterDocsCache: characterDocs
            }
            req.statusDoc = await logStatus(req); // Specific Ordering
            if(req.statusDoc === null) { // Error Prevention
                queryIsRunning = false;
                continue;
            }
            if(req.statusDoc.serverOnline === false) { // If the server is offline, don't do anything else.
                queryIsRunning = false;
                continue;
            }
            await lotteryHandler(req);
            await logFloatingObjs(req);
            await logChat(req);
            await logPlayers(req);
            await logCharacters(req);
            await hotzoneHandler(req);
            let newGridDocsCache = await logGrids(req); // The last one needs await to ensure it's only running for one server at a time (performance reasons)
            if (newGridDocsCache === null || newGridDocsCache === undefined) { // If grid query failed or didn't run, cancel the rest.
                queryIsRunning = false;
                console.log(`Grid Query for guild ID ${guildID} failed. Cancelling the rest.`)
                continue;
            }
            
            // Hoover using absolute most recent grid information.
            req.gridDocsCache = newGridDocsCache;
            newGridDocsCache = await updateHoover(req);
            req.gridDocsCache = newGridDocsCache;
            newGridDocsCache = await executeHoover(req);


            for(const doc of newGridDocsCache) { // Save all changes to gridCache to the database
                const cacheIndex = newGridDocsCache.indexOf(doc);
                try {
                    doc.save().then(savedDoc => {
                        newGridDocsCache[cacheIndex] = savedDoc;
                    }).catch(err => {});
                } catch(err) {}
                
            }

            // Setting final vars
            const runTime = Date.now() - execution_time;
            console.log(`All queries/updates took ${ms(runTime)}`)
            let baseDelayValue = runTime * 3 || 60000; // Set base delay to 3x the runtime of an individual server's query speed
            if (baseDelayValue < 60000) {
                baseDelayValue = 60000 // Ensure it is no less than 60 seconds to avoid crashing the remote API
            }
            console.log(`New Query Delay: ${baseDelayValue / 1000}s`)

            client.lastGridDocCache.set(guildID, gridDocsCache);
            client.gridDocCache.set(guildID, newGridDocsCache);
            client.queryDelays.set(guildID, baseDelayValue);

            //logVoxels(req); Disabled due to memory error
            console.log(`Finished queries for guild ID ${guildID}`)
            queryIsRunning = false;
            // Running test before finishing the noob caching
        }
    }, 5000) //  Main timers are now handled in each query seperately. This just restarts the queries when the last server finishes.
}