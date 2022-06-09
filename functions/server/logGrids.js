const gridModel = require('../../models/gridSchema');
const npcGridModel = require('../../models/npcGridSchema');
const playerEcoModel = require('../../models/playerEcoSchema');
const gridValueCalculator = require('../../functions/misc/gridValueCalculator');
const checkGridForFaction = require('../database/checkGridForFaction');
const serverLogModel = require('../../models/serverLogSchema');
const ms = require('ms')

const queryGrids = require('../execution/queryGrids');
const getNearbyGrids = require('../database/nearbyGrids');
const getNearbyCharacters = require('../database/nearbyCharacters');
const timerFunction = require('../database/timerFunction');
const spawnerGridHandler = require('../../handlers/spawnerGridHandler');


let insertData = [];
let npcInsertData = [];
module.exports = async (req) => {
    const guildID = req.guildID;
    const config = req.config;
    const settings = req.settings;
    const client = req.client;
    const NPCNames = client.commonVars.get("NPCNames");
    const NPCGridNames = client.commonVars.get("NPCGridNames");
    const respawnShipNames = client.commonVars.get("respawnShipNames");

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
    if (timer === true) return gridDocsCache; // If there is a timer, cancel.

    const guild = client.guilds.cache.get(guildID);
    const mainGuild = client.guilds.cache.get("853247020567101440");

    if (guild.owner === null) return null;
    let guildOwner = mainGuild.members.cache.get(guild.owner.user.id);
    if (!guildOwner) return null; // If guild owner is no longer in Cosmofficial discord
    console.log('Running Grid Query')

    // Grids Init
    const expirationInSeconds = 150;
    const expiration_time = current_time + (expirationInSeconds * 1000);
    let gridData = await queryGrids(config)

    let entityIDs = [];
    let factionTagCache = [];
    if (gridData === [] || gridData === undefined || gridData.length === 0) return null;
    // If queries are not broken, handle the data.
    for (let i = 0; i < gridData.length; i++) {
        if (gridData[i] === undefined) continue;
        await spawnerGridHandler(guildID, gridData[i]) // Spawner Grid Handler/checker/Exploit Prevention
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
        let nearbyChars = await getNearbyCharacters(guildID, singleGrid.Position.X, singleGrid.Position.Y, singleGrid.Position.Z, factionTag, 10000, req.allianceCache, req.characterDocsCache);
        let nearbyGrids = await getNearbyGrids(client, guildID, singleGrid.Position.X, singleGrid.Position.Y, singleGrid.Position.Z, factionTag, 10000, gridDocsCache, req.allianceCache);
        let gridDoc;
        let npcGridDoc;
        try {
            gridDoc = gridDocsCache.find(doc => doc.entityID === singleGrid.EntityId)
        } catch (err) {}
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
            }); // Leaving these individual create statements here because of the "caching" system
            if (NPCNames.includes(singleGrid.OwnerDisplayName) === true || singleGrid.OwnerDisplayName.includes(' CEO') === true) { // Create a template of the NPC's first appearance to compare with future queries
                if (singleGrid.DisplayName.includes('Lane Buoy') === false) {
                    npcGridDoc = await npcGridModel.create({
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
                    });
                }
            }
            gridDocsCache.push(gridDoc)
        } else { // If grid is found in db, just update information
            if(gridDoc.ownerDisplayName !== singleGrid.OwnerDisplayName) { // If the ownership has changed
                if (NPCNames.includes(gridDoc.ownerDisplayName) === true || gridDoc.ownerDisplayName.includes(' CEO')) { // If an NPC is detected as taken over
                    if (gridDoc.displayName.includes("Lane Buoy") === false) {
                        let npcGridDoc = await npcGridModel.findOne({
                            guildID: doc.guildID,
                            entityID: doc.entityID
                        })
                        let price = await gridValueCalculator(doc);
                        if (npcGridDoc !== null) {
                            console.log(`${npcGridDoc.displayName} was taken over. Grid Value: ${price}`);
                            const verDoc = verificationCache.find(doc => doc.username === singleGrid.OwnerDisplayName);
                            if(verDoc !== undefined) {
                                playerEcoDoc = await playerEcoModel.findOne({
                                    guildID: guildID,
                                    userID: verDoc.userID
                                })
                                playerEcoDoc.currency = parseInt(playerEcoDoc.currency) + price;
                                playerEcoDoc.save();
                            }
                            npcGridDoc.remove();
                        }
                    }
                }
            }
            const cacheIndex = gridDocsCache.indexOf(gridDoc);
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
            gridDocsCache[cacheIndex] = gridDoc; // Saving changes at the END of the query to prevent double save document errors
            if (NPCNames.includes(singleGrid.OwnerDisplayName) === true || singleGrid.OwnerDisplayName.includes(' CEO') === true) {
                if (singleGrid.DisplayName.includes('Lane Buoy') === false) {
                    // Create a template of the NPC's first appearance to compare with future queries
                    npcGridDoc = await npcGridModel.findOne({
                        guildID: guildID,
                        entityID: singleGrid.EntityId
                    })
                    if (npcGridDoc === null) { // Extra check to ensure the comparison document exists
                        console.log('npc doc created')
                        npcGridDoc = await npcGridModel.create({
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
                        });
                    } else {
                        npcGridDoc.displayName = singleGrid.DisplayName
                        npcGridDoc.blocksCount = singleGrid.BlocksCount
                        npcGridDoc.mass = Math.round(singleGrid.Mass)
                        npcGridDoc.positionX = singleGrid.Position.X
                        npcGridDoc.positionY = singleGrid.Position.Y
                        npcGridDoc.positionZ = singleGrid.Position.Z
                        npcGridDoc.linearSpeed = singleGrid.LinearSpeed
                        npcGridDoc.distanceToPlayer = singleGrid.DistanceToPlayer
                        npcGridDoc.ownerDisplayName = singleGrid.OwnerDisplayName
                        npcGridDoc.isPowered = singleGrid.IsPowered
                        npcGridDoc.PCU = singleGrid.PCU
                        npcGridDoc.expirationTime = expiration_time
                        npcGridDoc.save();
                    }
                }
            }
        }
    }

    gridDocsCache.forEach(async doc => { // Attempt to find clues to log
        let index = gridDocsCache.indexOf(doc);
        if (doc.expirationTime < current_time && entityIDs.includes(doc.entityID) === false) {
            if (NPCNames.includes(doc.ownerDisplayName) === true || doc.ownerDisplayName.includes(' CEO')) { // If an NPC is detected as destroyed (or despawned)
                if (doc.displayName.includes("Lane Buoy") === false) {
                    let npcGridDoc = await npcGridModel.findOne({
                        guildID: doc.guildID,
                        entityID: doc.entityID
                    })
                    let price = await gridValueCalculator(doc);
                    if (npcGridDoc !== null) {
                        console.log(`${npcGridDoc.displayName} no longer exists. Grid Value: ${price}`);
                        let sortedNearby = doc.nearby[0].enemyGrids.sort((a, b) => ((Number(a.distance)) > (Number(b.distance))) ? 1 : -1);
                        let verDoc;
                        try {
                            verDoc = verificationCache.find(doc => doc.username === sortedNearby[0].ownerDisplayName);
                        } catch(err) {}
                        if(verDoc !== undefined) {
                            playerEcoDoc = await playerEcoModel.findOne({
                                guildID: guildID,
                                userID: verDoc.userID
                            })
                            playerEcoDoc.currency = parseInt(playerEcoDoc.currency) + price;
                            playerEcoDoc.save();
                        }
                        npcGridDoc.remove(); // Waiting to see if this portion works
                    }
                }
            }


            doc.remove().catch(err => {});
            gridDocsCache.splice(index, 1);
            return console.log(`${doc.displayName} Grid expired`)
        }
        return; // Extra return to ensure forEach ends, doesn't hurt lol
    })
    console.log(`Grid query took ${ms((Date.now() - current_time))}`);
    return gridDocsCache;
}