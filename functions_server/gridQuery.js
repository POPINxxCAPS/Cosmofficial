const gridModel = require('../models/gridSchema');
const chatModel = require('../models/chatSchema');
const gridDocGridForFaction = require('../functions_db/checkGridForFaction');
const discordSettingsModel = require('../models/discordServerSettngsSchema')
const hooverSettingModel = require('../models/hooverSettingSchema');
const verificationModel = require('../models/verificationSchema');
const serverLogModel = require('../models/serverLogSchema');
const NPCDeathRewarder = require('../functions_execution/NPCDeathRewarder');


const queryGrids = require('../functions_execution/queryGrids')
const getNearbyGrids = require('../functions_db/nearbyGrids');
const getNearbyCharacters = require('../functions_db/nearbyCharacters');
const timerFunction = require('../functions_db/timerFunction');
const spawnerGridHandler = require('../handlers/spawnerGridHandler');

const NPCNames = ['The Tribunal', 'Contractors', 'Gork and Mork', 'Space Pirates', 'Space Spiders', 'The Chairman', 'Miranda Survivors', 'VOID', 'The Great Tarantula', 'Cosmofficial', 'Clang Technologies CEO', 'Merciless Shipping CEO', 'Mystic Settlers CEO', 'Royal Drilling Consortium CEO', 'Secret Makers CEO', 'Secret Prospectors CEO', 'Specialized Merchants CEO', 'Star Inventors CEO', 'Star Minerals CEO', 'The First Heavy Industry CEO', 'The First Manufacturers CEO', 'United Industry CEO', 'Universal Excavators CEO', 'Universal Miners Guild CEO', 'Unyielding Excavators CEO'];
const NPCGridNames = ['Mining vessel Debris', 'Mining ship Debris', 'Daniel A. Collins', 'Transporter debree']
const respawnShipNames = ['Respawn Station', 'Respawn Planet Pod', 'Respawn Space Pod']

// Pyramid of HELL noob code lmfao (Getting smaller, slowly)
let verificationCache = [];
let verificationNameCache = [];
module.exports = async (req) => {
    const guildID = req.guildID;
    const config = req.config;
    const settings = req.settings;
    const client = req.client;
    const current_time = Date.now();
    if (settings.serverOnline === 'false' || settings.serverOnline === undefined) return;
    req.expirationInSeconds = 75;
    req.name = 'logGrids'
    const timergridDoc = await timerFunction(req);
    if (timergridDoc === true) return; // If there is a timer, cancel.
    let cancel = false;
    let chatDoc = await chatModel.findOne({
        guildID: guildID
    })
    if (chatDoc === null) return;
    for (let i = 0; i < chatDoc.chatHistory.length; i++) {
        let chat = chatDoc.chatHistory[i];
        if (chat.content.includes('WARNING! Server will restart in 5 minutes') && (current_time - chat.msTimestamp) < 420000) {
            cancel = true;
        }
    }
    if (cancel === true) return;

    let hooverTriggered = false;
    // Check if hoover settings should be loaded/used
    const guild = client.guilds.cache.get(guildID);
    const mainGuild = client.guilds.cache.get("853247020567101440");

    let guildOwner = mainGuild.members.cache.get(guild.owner.user.id);
    if (!guildOwner) return; // If guild owner is no longer in Cosmofficial discord

    let discordSettings = await discordSettingsModel.findOne({
        guildID: guildID
    })
    if (discordSettings === null) return;
    let serverOnline = discordSettings.serverOnline

    let hooverSettings = await hooverSettingModel.findOne({
        guildID: guildID
    })



    if (serverOnline === false) return;
    // Grids Init
    const expirationInSeconds = 59;
    const expiration_time = current_time + (expirationInSeconds * 1000);
    let gridData = await queryGrids(config)


    let entityIDs = [];
    let gridDocsCache = await gridModel.find({
        guildID: guildID
    })
    if (gridData !== [] && gridData !== undefined) { // If queries are not broken, handle the data.
        for (let i = 0; i < gridData.length; i++) {
            spawnerGridHandler(guildID, gridData[i]) // Spawner Grid Handler/checker/Exploit Prevention
            entityIDs.push(gridData[i].EntityId) // Add the grid's entity ID to the "existing" list9


            let factionTag = await gridDocGridForFaction.serverGrid(gridData[i], guildID); // Get faction tag from owner of the grid

            let nearbyChars = await getNearbyCharacters(guildID, gridData[i].Position.X, gridData[i].Position.Y, gridData[i].Position.Z, factionTag);
            let nearbyGrids = await getNearbyGrids(guildID, gridData[i].Position.X, gridData[i].Position.Y, gridData[i].Position.Z, factionTag, 15000, gridDocsCache);

            let gridDoc = await gridModel.findOne({
                entityID: gridData[i].EntityId,
                guildID: guildID
            }); // Check if the grid exists already in the database 
            if (gridDoc === null) { // If no file found, create one.
                gridDoc = await gridModel.create({
                    guildID: guildID,
                    displayName: gridData[i].DisplayName,
                    entityID: gridData[i].EntityId,
                    gridSize: gridData[i].GridSize,
                    blocksCount: gridData[i].BlocksCount,
                    mass: Math.round(gridData[i].Mass),
                    positionX: gridData[i].Position.X,
                    positionY: gridData[i].Position.Y,
                    positionZ: gridData[i].Position.Z,
                    linearSpeed: gridData[i].LinearSpeed,
                    distanceToPlayer: gridData[i].DistanceToPlayer,
                    ownerSteamID: gridData[i].OwnerSteamId,
                    ownerDisplayName: gridData[i].OwnerDisplayName,
                    isPowered: gridData[i].IsPowered,
                    PCU: gridData[i].PCU,
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
                });

                /* Server log crap (disabled)
                if (gridsNearby.length !== 0) { // If there are grids nearby, gridDoc the grid for possible clues to log
                    // If there are grid nearby, gridDoc how many friendly/enemy grids there are
                    let enemyGridsFound = 0;
                    let friendlyGridsFound = 0;
                    let enemyFactionTag;
                    for (let a = 0; a < gridsNearby.length; a++) {
                        let grid = gridsNearby[a];
                        if (grid.factionTag !== doc.FactionTag) { // If grid facTag does not match the target grid facTag
                            enemyGridsFound += 1;
                            enemyFactionTag = grid.factionTag // Set the enemy facTag
                        } else {
                            friendlyGridsFound += 1;
                        }
                    }

                    // Server log messages
                    if (NPCNames.includes(doc.OwnerDisplayName)) {
                        await serverLogModel.create({
                            guildID: guildID,
                            category: 'npc',
                            string: `NPC Spawned - ${doc.DisplayName}`
                        })
                    } else if (respawnShipNames.includes(doc.DisplayName) === true) {
                        await serverLogModel.create({
                            guildID: guildID,
                            category: 'misc',
                            string: `${doc.OwnerDisplayName} spawned in a ${doc.DisplayName}`
                        })
                    } else if (friendlyGridsFound >= 0 && enemyGridsFound <= 1) { // Assume faction is building
                        await serverLogModel.create({
                            guildID: guildID,
                            category: 'created',
                            string: `${doc.DisplayName} built by [${factionTag}]`
                        })
                    } else if (enemyFactionTag !== undefined && NPCNames.includes(doc.OwnerDisplayName) === false) { // Assume enemy is blowing grids up
                        await serverLogModel.create({
                            guildID: guildID,
                            category: 'created',
                            string: `${doc.DisplayName} wreckage created by [${enemyFactionTag}]`
                        })
                    }
                    
                } else {
                    if (NPCNames.includes(doc.OwnerDisplayName)) {
                        await serverLogModel.create({
                            guildID: guildID,
                            category: 'npc',
                            string: `NPC Spawned - ${doc.DisplayName}`
                        })
                    } else {
                        await serverLogModel.create({
                            guildID: guildID,
                            category: 'created',
                            string: `${doc.DisplayName} built by [${factionTag}]`
                        })
                    }
                }*/
            } else { // If grid is found in db, just update information
                /*if (gridDoc.displayName !== gridData[i].DisplayName) { // If grid is renamed
                    await serverLogModel.create({
                        guildID: guildID,
                        category: 'misc',
                        string: `[${gridDoc.factionTag}] ${gridDoc.displayName} renamed to ${gridData[i].DisplayName}`
                    })
                } //
                if (gridDoc.ownerDisplayName !== gridData[i].OwnerDisplayName) { // If ownership given or taken by another faction
                    await serverLogModel.create({
                        guildID: guildID,
                        category: 'taken',
                        string: `[${factionTag}] ${gridData[i].OwnerDisplayName} claimed [${gridDoc.factionTag}] ${gridDoc.displayName}`
                    })
                }
                // End server log messages, except jumping
                var dx = gridDoc.positionX - gridData[i].Position.X;
                var dy = gridDoc.positionY - gridData[i].Position.Y;
                var dz = gridDoc.positionZ - gridData[i].Position.Z;

                let distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                if (distance > 30000) { // Assume jump drive used if grid has traveled more than 30,000m since last query
                    await serverLogModel.create({
                        guildID: guildID,
                        category: 'jumped',
                        string: `[${factionTag}] ${gridData[i].DisplayName} jumped ${Math.round(distance).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}m`
                    })
                }
                */ // Server log stuff (disabled)
                gridDoc.displayName = gridData[i].DisplayName
                gridDoc.blocksCount = gridData[i].BlocksCount
                gridDoc.mass = Math.round(gridData[i].Mass)
                gridDoc.positionX = gridData[i].Position.X
                gridDoc.positionY = gridData[i].Position.Y
                gridDoc.positionZ = gridData[i].Position.Z
                gridDoc.linearSpeed = gridData[i].LinearSpeed
                gridDoc.distanceToPlayer = gridData[i].DistanceToPlayer
                gridDoc.ownerDisplayName = gridData[i].OwnerDisplayName
                gridDoc.isPowered = gridData[i].IsPowered
                gridDoc.PCU = gridData[i].PCU
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
                if (hooverSettings.hooverEnabled === true) {
                    if (parseInt(hooverSettings.nextCleanup) < current_time) {
                        hooverTriggered = true;
                        let verDoc = null;
                        if (verificationNameCache.includes(gridData[i].OwnerDisplayName) === true) { // If verification doc is already download
                            verificationCache.forEach(verification => { // Find and set variable
                                if (verification === null) return; // Redundancy check
                                if (verification.username === gridDoc.ownerDisplayName) { // If usernames match, store doc into current variable
                                    verDoc = verification;
                                } else return;
                            })
                        } else { // If verification doc is not downloaded, check for it
                            verDoc = await verificationModel.findOne({
                                username: gridData[i].OwnerDisplayName
                            })
                            if (verDoc !== null) { // If verdoc found, set variable and add to cache
                                verificationCache.push(verDoc);
                                verificationNameCache.push(gridDoc.ownerDisplayName);
                            }
                        } // Continue to check hoover cleanup


                        if (gridDoc.queuedForDeletion === false && gridData[i].GridSize === 'Large' && hooverSettings.largeGridAllowed === false) {
                            gridDoc.deletionReason = 'large grids not allowed'
                            gridDoc.queuedForDeletion = true;
                            gridDoc.deletionTime = current_time + 86400000;
                            if (verDoc !== null) {
                                let memberTarget = guild.members.cache.find(member => member.id === verDoc.userID)
                                try {
                                    //memberTarget.send(`**__Warning__**\n>>> ${gridDoc.displayName} has been deleted.\nLarge grids are not allowed.`)
                                } catch (err) {}
                            }
                        }
                        if (gridDoc.queuedForDeletion === false && gridData[i].GridSize === 'Small' && hooverSettings.smallGridAllowed === false) {
                            gridDoc.deletionReason = 'small grids not allowed'
                            gridDoc.queuedForDeletion = true;
                            gridDoc.deletionTime = current_time + 86400000;
                            if (verDoc !== null) {
                                let memberTarget = guild.members.cache.find(member => member.id === verDoc.userID)
                                try {
                                    //memberTarget.send(`**__Warning__**\n>>> ${gridDoc.displayName} has been deleted.\nSmall grids are not allowed.`)
                                } catch (err) {}
                            }
                        }
                        if (gridDoc.queuedForDeletion === false && gridDoc.blocksCount < parseInt(hooverSettings.blockThreshold) && NPCGridNames.includes(gridData[i].DisplayName) === false && NPCNames.includes(gridData[i].OwnerDisplayName) === false) {
                            gridDoc.deletionReason = 'less than block threshold'
                            gridDoc.queuedForDeletion = true;
                            gridDoc.deletionTime = current_time + 86400000;
                            if (verDoc !== null) {
                                let memberTarget = guild.members.cache.find(member => member.id === verDoc.userID)
                                try {
                                    //memberTarget.send(`**__Warning__**\n>>> ${gridDoc.displayName} is less than ${hooverSettings.blockThreshold} blocks.\nIncrease the build size within 24hrs or the grid will be removed!`)
                                } catch (err) {}
                            }
                        }
                        if (gridDoc.queuedForDeletion === false && gridData[i].IsPowered === false && hooverSettings.unpoweredGridRemoval === true && NPCNames.includes(gridData[i].OwnerDisplayName) === false) {
                            gridDoc.deletionReason = 'unpowered'
                            gridDoc.queuedForDeletion = true;
                            gridDoc.deletionTime = current_time + 86400000;
                            if (verDoc !== null) {
                                let memberTarget = guild.members.cache.find(member => member.id === verDoc.userID)
                                try {
                                    //memberTarget.send(`**__Warning__**\n>>> ${gridDoc.displayName} has run out of power.\nRestore power within 24hrs or the grid will be removed!`)
                                } catch (err) {}
                            }
                        }
                        // Unfinished
                        if (hooverSettings.cleanUnverifiedPlayerGrids === true) { // If unverified cleanup is enabled
                            if (verDoc === null && gridDoc.queuedForDeletion === false) { // If verdoc is not found, and grid is not already queued for deletion
                                if (gridDoc.queuedForDeletion === false && NPCNames.includes(gridData[i].OwnerDisplayName) === false) {
                                    if (gridDoc.ownerDisplayName === '') {
                                        gridDoc.deletionReason = 'no clear owner'
                                        gridDoc.queuedForDeletion = true;
                                        gridDoc.deletionTime = current_time + 86400000;
                                    } else {
                                        gridDoc.deletionReason = 'unverified player grid'
                                        gridDoc.queuedForDeletion = true;
                                        gridDoc.deletionTime = current_time + 86400000;
                                    }
                                }
                            } else if (verDoc !== null) {
                                // If there is a verification doc, try to see if they are still in the discord.
                                let memberTarget = await guild.members.cache.get(verDoc.userID);
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
            }

            gridDoc.save();
        }

        if (hooverTriggered === true) {
            hooverSettings.nextCleanup = current_time + parseInt(hooverSettings.cleanupInterval);
            try {
                await hooverSettings.save();
            } catch (err) {}
        }
        let discordSettings = await discordSettingsModel.findOne({ // Double gridDoc before deleting documents
            guildID: guildID
        })
        if (discordSettings === null) return;
        let serverOnline = discordSettings.serverOnline;
        if (serverOnline === false) return; // Continue to delete documents

        setTimeout(async () => {
            const documents = await gridModel.find({
                guildID: guildID
            });
            documents.forEach(async doc => { // Attempt to find clues to log
                if (doc.expirationTime < current_time) {
                    if (entityIDs.includes(doc.entityID) === false) {
                        /*
                            if (respawnShipNames.includes(doc.displayName)) {
                                await serverLogModel.create({
                                    guildID: guildID,
                                    category: 'misc',
                                    string: `${doc.ownerDisplayName}'s ${doc.displayName} despawned.`
                                })
                            } else if (enemyFactionTag !== undefined) { // If enemy faction tag found
                                await serverLogModel.create({
                                    guildID: guildID,
                                    category: 'destroyed',
                                    string: `${doc.displayName} likely destroyed by [${enemyFactionTag}]`
                                })
                            } else if (friendlyGridsFound <= 1 && enemyGridsFound === 0 && NPCNames.includes(doc.ownerDisplayName) === false) {
                                await serverLogModel.create({
                                    guildID: guildID,
                                    category: 'destroyed',
                                    string: `${doc.displayName} likely destroyed. No grids nearby`
                                })
                            } else if (NPCNames.includes(doc.ownerDisplayName) === false) {
                                await serverLogModel.create({
                                    guildID: guildID,
                                    category: 'docked',
                                    string: `${doc.displayName} likely docked. ${friendlyGridsFound} friendly grids nearby`
                                })
                            } else if (NPCNames.includes(doc.ownerDisplayName)) {
                                await serverLogModel.create({
                                    guildID: guildID,
                                    category: 'npc',
                                    string: `NPC Despawned - ${doc.displayName}`
                                })
                            }
                        }
                        */ // Disabled server-log stuff
                        try {
                            doc.remove()
                        } catch (err) {
                            console.log('Grid database remove error caught')
                        }
                        return console.log(`${doc.displayName} Grid expired`)
                    }
                }
            })
        }, 20000)
    }
    return;
}