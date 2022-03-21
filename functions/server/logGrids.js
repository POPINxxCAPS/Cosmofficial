const gridModel = require('../../models/gridSchema');
const checkGridForFaction = require('../database/checkGridForFaction');
const serverLogModel = require('../../models/serverLogSchema');
const ms = require('ms')

const queryGrids = require('../execution/queryGrids');
const getNearbyGrids = require('../database/nearbyGrids');
const getNearbyCharacters = require('../database/nearbyCharacters');
const timerFunction = require('../database/timerFunction');
const spawnerGridHandler = require('../../handlers/spawnerGridHandler');

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

    const statusDoc = req.statusDoc; // Confirm server is being reported as online before attempting query
    if (statusDoc === null || statusDoc.serverOnline === false || statusDoc.serverOnline === undefined) return null;

    const current_time = Date.now();
    if (req.gridQueryDelay === undefined) {
        req.expirationInSeconds = 90;
    } else {
        req.expirationInSeconds = req.gridQueryDelay / 1000;
    }
    req.name = 'logGrids'
    const timer = await timerFunction(req);
    if (timer === true) return null; // If there is a timer, cancel.

    const guild = client.guilds.cache.get(guildID);
    const mainGuild = client.guilds.cache.get("853247020567101440");

    if (guild.owner === null) return null;
    let guildOwner = mainGuild.members.cache.get(guild.owner.user.id);
    if (!guildOwner) return null; // If guild owner is no longer in Cosmofficial discord
    console.log('Running Grid Query')

    // Grids Init
    const expirationInSeconds = 3600;
    const expiration_time = current_time + (expirationInSeconds * 1000);
    let gridData = await queryGrids(config)

    let entityIDs = [];
    let factionTagCache = [];
    if (gridData !== [] && gridData !== undefined && gridData.length !== 0) { // If queries are not broken, handle the data.
        for (let i = 0; i < gridData.length; i++) {
            if(gridData[i] === undefined) continue;
            spawnerGridHandler(guildID, gridData[i]) // Spawner Grid Handler/checker/Exploit Prevention
            entityIDs.push(gridData[i].EntityId) // Add the grid's entity ID to the "existing" list
            const singleGrid = gridData[i];

            let factionTag = factionTagCache.find(cache => cache.username === singleGrid.OwnerDisplayName) // Attempt to use cache to avoid using the below function
            if (factionTag === undefined || factionTag === null) {
                factionTag = await checkGridForFaction.serverGrid(singleGrid, guildID); // Get faction tag from owner of the grid
                factionTagCache.push({
                    username: singleGrid.OwnerDisplayName,
                    factionTag: factionTag
                })
            } else {
                factionTag = factionTag.factionTag
            }
            let nearbyChars = await getNearbyCharacters(guildID, singleGrid.Position.X, singleGrid.Position.Y, singleGrid.Position.Z, factionTag, 15000, req.allianceCache, req.characterDocsCache);
            let nearbyGrids = await getNearbyGrids(guildID, singleGrid.Position.X, singleGrid.Position.Y, singleGrid.Position.Z, factionTag, 15000, gridDocsCache, req.allianceCache);

            let gridDoc;
            try {
              gridDoc = gridDocsCache.find(doc => doc.entityID === singleGrid.EntityId)
            } catch(err) {}
            if(gridDoc === undefined) continue;       
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
            cacheIndex = gridDocsCache.indexOf(gridDoc);
            gridDoc.save().then(savedDoc => {
                gridDoc = savedDoc;
                gridDocsCache[cacheIndex] = gridDoc;
            }).catch(async (err) => {
                gridDoc = await gridModel.findOne({
                    guildID: guildID,
                    entityID: singleGrid.EntityId
                })
                gridDocsCache[cacheIndex] = gridDoc;
                console.log('Error Caught + Fixed')
            }); // Await this save so it stores the updated doc version information
        }

        gridDocsCache.forEach(async doc => { // Attempt to find clues to log
            let index = gridDocsCache.indexOf(doc);
            if (doc.expirationTime < current_time && entityIDs.includes(doc.entityID) === false) {
                doc.remove();
                gridDocsCache.splice(index, 1);
                return console.log(`${doc.displayName} Grid expired`)
            }
            return; // Extra return to ensure forEach ends, doesn't hurt lol
        })
    }
    console.log(`Grid query took ${ms((Date.now() - current_time))}`);
    const runTime = (Date.now() - current_time);
    return gridDocsCache;
}
