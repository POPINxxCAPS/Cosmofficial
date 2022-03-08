const gridModel = require('../models/gridSchema');
const chatModel = require('../models/chatSchema');
const gridDocGridForFaction = require('../functions_db/checkGridForFaction');
const discordSettingsModel = require('../models/discordServerSettingsSchema')
const hooverSettingModel = require('../models/hooverSettingSchema');
const verificationModel = require('../models/verificationSchema');
const serverLogModel = require('../models/serverLogSchema');
const NPCDeathRewarder = require('../functions_execution/NPCDeathRewarder');
const ms = require('ms')


const queryGrids = require('../functions_execution/queryGrids')
const getNearbyGrids = require('../functions_db/nearbyGrids');
const getNearbyCharacters = require('../functions_db/nearbyCharacters');
const timerFunction = require('../functions_db/timerFunction');
const spawnerGridHandler = require('../handlers/spawnerGridHandler');

const NPCNames = ['The Tribunal', 'Contractors', 'Gork and Mork', 'Space Pirates', 'Space Spiders', 'The Chairman', 'Miranda Survivors', 'VOID', 'The Great Tarantula', 'Cosmofficial', 'Clang Technologies CEO', 'Merciless Shipping CEO', 'Mystic Settlers CEO', 'Royal Drilling Consortium CEO', 'Secret Makers CEO', 'Secret Prospectors CEO', 'Specialized Merchants CEO', 'Star Inventors CEO', 'Star Minerals CEO', 'The First Heavy Industry CEO', 'The First Manufacturers CEO', 'United Industry CEO', 'Universal Excavators CEO', 'Universal Miners Guild CEO', 'Unyielding Excavators CEO'];
const NPCGridNames = ['Mining vessel Debris', 'Mining ship Debris', 'Daniel A. Collins', 'Transporter debree']
const respawnShipNames = ['Respawn Station', 'Respawn Planet Pod', 'Respawn Space Pod']

let insertData = [];
// Pyramid of HELL noob code lmfao (Getting smaller, slowly)
module.exports = async (req) => {
    const guildID = req.guildID;
    const config = req.config;
    const settings = req.settings;
    const client = req.client;
    const verificationCache = req.verDocs;
    let gridDocsCache = req.gridDocsCache;
    if (gridDocsCache === undefined) return console.log('Fix me') // lol
    if (settings.serverOnline === false || settings.serverOnline === undefined) return null;


    const current_time = Date.now();
    if (req.gridQueryDelay === undefined) {
        req.expirationInSeconds = 90;
    } else {
        req.expirationInSeconds = req.gridQueryDelay / 1000;
    }
    req.name = 'logGrids'
    const timer = await timerFunction(req);
    if (timer === true) return null; // If there is a timer, cancel.

    let hooverTriggered = false;
    // Check if hoover settings should be loaded/used
    const guild = client.guilds.cache.get(guildID);
    const mainGuild = client.guilds.cache.get("853247020567101440");

    if(guild.owner === null) return null;
    let guildOwner = mainGuild.members.cache.get(guild.owner.user.id);
    if (!guildOwner) return null; // If guild owner is no longer in Cosmofficial discord

    let hooverSettings = await hooverSettingModel.findOne({
        guildID: guildID
    })

    console.log('Running Grid Query')

    // Grids Init
    const expirationInSeconds = 3600;
    const expiration_time = current_time + (expirationInSeconds * 1000);
    let gridData = await queryGrids(config)

    let entityIDs = [];
    let factionTagCache = [];
    if (gridData !== [] && gridData !== undefined && gridData.length !== 0) { // If queries are not broken, handle the data.
        for (let i = 0; i < gridData.length; i++) {
            spawnerGridHandler(guildID, gridData[i]) // Spawner Grid Handler/checker/Exploit Prevention
            entityIDs.push(gridData[i].EntityId) // Add the grid's entity ID to the "existing" list
            const singleGrid = gridData[i];

            let factionTag = factionTagCache.find(cache => cache.username === singleGrid.OwnerDisplayName) // Attempt to use cache to avoid using the below function
            if (factionTag === undefined || factionTag === null) {
                factionTag = await gridDocGridForFaction.serverGrid(singleGrid, guildID); // Get faction tag from owner of the grid
                factionTagCache.push({
                    username: singleGrid.OwnerDisplayName,
                    factionTag: factionTag
                })
            } else {
                factionTag = factionTag.factionTag
            }
            let nearbyChars = await getNearbyCharacters(guildID, singleGrid.Position.X, singleGrid.Position.Y, singleGrid.Position.Z, factionTag, 15000, req.allianceCache, req.characterDocsCache);
            let nearbyGrids = await getNearbyGrids(guildID, singleGrid.Position.X, singleGrid.Position.Y, singleGrid.Position.Z, factionTag, 15000, gridDocsCache, req.allianceCache);

            let gridDoc = gridDocsCache.find(doc => doc.entityID === singleGrid.EntityId)
            let cacheIndex;
            if (gridDoc === null || gridDoc === undefined) { // Attempt to download doc if not in the cache
                gridDoc = await gridModel.findOne({
                    guildID: guildID,
                    entityID: singleGrid.EntityId
                })
                if (gridDoc !== null) {
                    gridDocsCache.push(gridDoc)
                }
            }

            if (gridDoc === null || gridDoc === undefined) { // If no file found, create one.
                gridDoc = await gridModel.create({
                    guildID: guildID,
                    displayName: singleGrid.DisplayName,
                    entityID: singleGrid.EntityId,
                    gridSize: singleGrid.GridSize,
                    blocksCount: singleGrid.BlocksCount,
                    mass: Math.round(singleGrid.Mass),
                    positionX: singleGrid.Position.X,
                    positionY: singleGrid.Position.Y,
                    positionZ: singleGrid.Position.Z,
                    linearSpeed: singleGrid.LinearSpeed,
                    distanceToPlayer: singleGrid.DistanceToPlayer,
                    ownerSteamID: singleGrid.OwnerSteamId,
                    ownerDisplayName: singleGrid.OwnerDisplayName,
                    isPowered: singleGrid.IsPowered,
                    PCU: singleGrid.PCU,
                    expirationTime: expiration_time,
                    factionTag: factionTag,
                    queuedForDeletion: false,
                    nearby: [{
                        npcs: nearbyGrids.npcs,
                        friendlyGrids: nearbyGrids.friendlyGrids,
                        enemyGrids: nearbyGrids.enemyGrids,
                        friendlyCharacters: nearbyChars.friendlyCharacters,
                        enemyCharacters: nearbyChars.enemyCharacters,
                    }]
                }); // Leaving this one here because of the "caching" system
                gridDocsCache.push(gridDoc)
            } else { // If grid is found in db, just update information

                gridDoc.displayName = singleGrid.DisplayName
                gridDoc.blocksCount = singleGrid.BlocksCount
                gridDoc.mass = Math.round(singleGrid.Mass)
                gridDoc.positionX = singleGrid.Position.X
                gridDoc.positionY = singleGrid.Position.Y
                gridDoc.positionZ = singleGrid.Position.Z
                gridDoc.linearSpeed = singleGrid.LinearSpeed
                gridDoc.distanceToPlayer = singleGrid.DistanceToPlayer
                gridDoc.ownerDisplayName = singleGrid.OwnerDisplayName
                gridDoc.isPowered = singleGrid.IsPowered
                gridDoc.PCU = singleGrid.PCU
                gridDoc.expirationTime = expiration_time
                gridDoc.factionTag = factionTag
                gridDoc.nearby = [{
                    npcs: nearbyGrids.npcs,
                    friendlyGrids: nearbyGrids.friendlyGrids,
                    enemyGrids: nearbyGrids.enemyGrids,
                    friendlyCharacters: nearbyChars.friendlyCharacters,
                    enemyCharacters: nearbyChars.enemyCharacters,
                }]
            }
            // After adding/updating database, check grid for hoover settings, manage cleanup queue
            if (hooverSettings !== null && hooverSettings !== undefined) {
                if (hooverSettings.hooverEnabled === true && parseInt(hooverSettings.nextCleanup) < current_time) {
                    hooverTriggered = true;
                    const verDoc = verificationCache.find(verification => verification.username === gridDoc.ownerDisplayName)
                    if (gridDoc.queuedForDeletion === false && singleGrid.GridSize === 'Large' && hooverSettings.largeGridAllowed === false) {
                        gridDoc.deletionReason = 'large grids not allowed'
                        gridDoc.queuedForDeletion = true;
                        gridDoc.deletionTime = current_time + 86400000;
                    }
                    if (gridDoc.queuedForDeletion === false && singleGrid.GridSize === 'Small' && hooverSettings.smallGridAllowed === false) {
                        gridDoc.deletionReason = 'small grids not allowed'
                        gridDoc.queuedForDeletion = true;
                        gridDoc.deletionTime = current_time + 86400000;
                    }
                    if (gridDoc.queuedForDeletion === false && gridDoc.blocksCount < parseInt(hooverSettings.blockThreshold) && NPCGridNames.includes(singleGrid.DisplayName) === false && NPCNames.includes(singleGrid.OwnerDisplayName) === false) {
                        gridDoc.deletionReason = 'less than block threshold'
                        gridDoc.queuedForDeletion = true;
                        gridDoc.deletionTime = current_time + 86400000;
                    }
                    if (gridDoc.queuedForDeletion === false && singleGrid.IsPowered === false && hooverSettings.unpoweredGridRemoval === true && NPCNames.includes(singleGrid.OwnerDisplayName) === false) {
                        gridDoc.deletionReason = 'unpowered'
                        gridDoc.queuedForDeletion = true;
                        gridDoc.deletionTime = current_time + 86400000;
                    }
                    // Unfinished
                    if (hooverSettings.cleanUnverifiedPlayerGrids === true) { // If unverified cleanup is enabled
                        if ((verDoc === null || verDoc === undefined) === true && gridDoc.queuedForDeletion === false && NPCNames.includes(singleGrid.OwnerDisplayName) === false) { // If verdoc is not found, and grid is not already queued for deletion
                            if (gridDoc.ownerDisplayName === '') {
                                gridDoc.deletionReason = 'no clear owner'
                                gridDoc.queuedForDeletion = true;
                                gridDoc.deletionTime = current_time + 86400000;
                            } else {
                                gridDoc.deletionReason = 'unverified player grid'
                                gridDoc.queuedForDeletion = true;
                                gridDoc.deletionTime = current_time + 86400000;
                            }
                        } else if (verDoc !== null && verDoc !== undefined) {
                            // If there is a verification doc, try to see if they are still in the discord.
                            let memberTarget = guild.members.cache.find(member => member.id === verDoc.userID)
                            if (memberTarget === null || memberTarget === undefined) {
                                gridDoc.deletionReason = 'player left the discord'
                                gridDoc.queuedForDeletion = true;
                                gridDoc.deletionTime = current_time + 86400000;
                            } // Discord check end
                        }
                    }
                    //

                }
            }
            cacheIndex = gridDocsCache.indexOf(gridDoc);
            await gridDoc.save().then(savedDoc => {
                gridDoc = savedDoc;
            }).catch((err) => {
                console.log('Error Caught')
            }); // Await this save so it stores the updated doc version information
            gridDocsCache[cacheIndex] = gridDoc;
        }

        if (hooverTriggered === true) {
            hooverSettings.nextCleanup = current_time + parseInt(hooverSettings.cleanupInterval);
            hooverSettings.save();
        }
        gridDocsCache.forEach(async doc => { // Attempt to find clues to log
            let index = gridDocsCache.indexOf(doc);
            // Might need to manually remove old items from the cache, we'll see on the next loop tho
            if (doc.expirationTime < current_time) {
                if (entityIDs.includes(doc.entityID) === false) {
                    doc.remove()
                    gridDocsCache.splice(index, 1);

                    return console.log(`${doc.displayName} Grid expired`)
                }
            }
            return; // Extra return to ensure forEach ends, doesn't hurt lol
        })
    }
    console.log(`Grid query took ${ms((Date.now() - current_time))}`);
    const runTime = (Date.now() - current_time);
    return {
        gridDocsCache: gridDocsCache,
        runTime: runTime
    };
}