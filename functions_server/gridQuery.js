const gridModel = require('../models/gridSchema');
const chatModel = require('../models/chatSchema');
const checkGridForFaction = require('../functions_db/checkGridForFaction');
const discordSettingsModel = require('../models/discordServerSettngsSchema')
const hooverSettingModel = require('../models/hooverSettingSchema');
const verificationModel = require('../models/verificationSchema');
const serverLogModel = require('../models/serverLogSchema');
const spawnerModel = require('../models/spawnerSchema');
const NPCDeathRewarder = require('../functions_execution/NPCDeathRewarder');
const gridPowerOff = require('../functions_execution/gridPowerOff');

const NPCNames = ['The Tribunal', 'Contractors', 'Gork and Mork', 'Space Pirates', 'Space Spiders', 'The Chairman', 'Miranda Survivors', 'VOID', 'The Great Tarantula', 'Cosmofficial'];
const NPCGridNames = ['Mining vessel Debris', 'Mining ship Debris', 'Daniel A. Collins', 'Transporter debree']
const spawnerGridNames = ['Zone Chip Spawner', 'Ice Spawner', 'Iron Spawner', 'Silicon Spawner', 'Cobalt Spawner', 'Silver Spawner', 'Magnesium Spawner', 'Gold Spawner', 'Platinum Spawner', 'Uranium Spawner', 'Powerkit Spawner', 'Space Credit Converter']
const respawnShipNames = ['Respawn Station', 'Respawn Planet Pod', 'Respawn Space Pod']
const {
    filterBySearch
} = require('../lib/modifiers');
const sessionPath = '/v1/session';
const gridPath = `${sessionPath}/grids`;
const serverPath = '/v1/server';


const axios = require('axios');
const crypto = require('crypto');
const JSONBI = require('json-bigint')({
    storeAsString: true,
    useNativeBigInt: true
});
const querystring = require('querystring');
let verificationCache = [];
let verificationNameCache = [];
module.exports = async (guildID, config, settings, client) => {
    const current_time = Date.now();
    if (settings.serverOnline === 'false' || settings.serverOnline === undefined) return;
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

    let patron = false
    let guildOwner = mainGuild.members.cache.get(guild.owner.user.id);
    if (!guildOwner) return; // If guild owner is no longer in Cosmofficial discord

    if (guildOwner.roles.cache.has('883534965650882570') || guildOwner.roles.cache.has('883535930630213653')) {
        patron = true;
    }

    let discordSettings = await discordSettingsModel.findOne({
        guildID: guildID
    })
    if (discordSettings === null) return;
    let serverOnline = discordSettings.serverOnline

    let hooverSettings = await hooverSettingModel.findOne({
        guildID: guildID
    })



    if (serverOnline === false) return;
    const baseUrl = config.baseURL;
    const port = config.port;
    const prefix = config.prefix;
    const secret = config.secret;

    const getNonce = () => crypto.randomBytes(20).toString('base64');
    const getUtcDate = () => new Date().toUTCString();

    const opts = (method, api, {
        body,
        qs
    } = {}) => {
        const url = `${baseUrl}:${port}${prefix}${api}`;
        const nonce = getNonce();
        const date = getUtcDate();
        const query = qs ? `?${querystring.stringify(qs)}` : '';

        const key = Buffer.from(secret, 'base64');
        const message = `${prefix}${api}${query}\r\n${nonce}\r\n${date}\r\n`;
        const hash = crypto.createHmac('sha1', key).update(Buffer.from(message)).digest('base64');

        return {
            url: url + query,
            headers: {
                Authorization: `${nonce}:${hash}`,
                Date: date
            },
            transformRequest(data) {
                return JSONBI.stringify(data);
            },
            transformResponse(data) {
                return JSONBI.parse(data);
            },
            json: true,
            body,
            method
        };
    };

    const send = (method, path, {
        body,
        qs,
        log = false
    } = {}) => {
        if (log) {
            console.log(`${method}: ${opts(method, path).url}`)
        }

        return axios(opts(method, path, {
                body,
                qs
            }))
            .then((result) => {
                if (log) {
                    console.log(result);
                }

                const {
                    data: {
                        data
                    }
                } = result;
                return data || {};
            })
            .catch(e => {
                return;
            });
    };
    // End Bridge Init
    // Grids Init
    const expirationInSeconds = 59;
    const expiration_time = current_time + (expirationInSeconds * 1000);
    let gridData;
    const grids = async (search) => {
        try {
            const path = `${sessionPath}/grids`;
            const {
                Grids
            } = await send('GET', path)
            const collection = Grids;
            return filterBySearch(collection, search);
        } catch (err) {
            console.log(`Grid query for guild ID ${guildID} failed.`)
        }
    };

    await grids().then((result) => {
        gridData = result;
    }).catch(err => {})


    let entityIDs = [];
    let gridDocsCache = await gridModel.find({
        guildID: guildID
    })
    if (gridData !== [] && gridData !== undefined) { // If queries are not broken, handle the data.
        for (let i = 0; i < gridData.length; i++) {
            if (spawnerGridNames.includes(gridData[i].DisplayName)) { // If it's a spawner grid, check to see if the grid should be powered off. (Deactivation timer failed)
                let spawnerDoc = await spawnerModel.findOne({
                    guildID: guildID,
                    gridName: gridData[i].DisplayName
                })
                if (spawnerDoc !== null) { // Redundancy Check
                    if (spawnerDoc.expirationTime < current_time && gridData[i].IsPowered === true) {
                        gridPowerOff(guildID, gridData[i].EntityId)
                    }
                }
            }
            let check = await gridModel.findOne({
                entityID: gridData[i].EntityId,
                guildID: guildID
            });
            let factionTag = '';
            await checkGridForFaction.serverGrid(gridData[i], guildID).then((result) => {
                factionTag = result
            });
            if (factionTag === undefined) {
                factionTag = 'NoF'
            }
            if (check === null) { // If no file found, create
                entityIDs.push(gridData[i].EntityId)
                try {
                    check = await gridModel.create({
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
                    });

                    let gridsNearby = [];
                    let gridsDangerClose = [];
                    let documents = gridDocsCache;
                    let doc = gridData[i];
                    
                    for (let i = 0; i < documents.length; i++) {
                        let checkGrid = documents[i];
                        var dx = checkGrid.positionX - doc.Position.X;
                        var dy = checkGrid.positionY - doc.Position.Y;
                        var dz = checkGrid.positionZ - doc.Position.Z;

                        let distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                        if (distance < 400) {
                            gridsDangerClose.push(checkGrid)
                        }
                        if (distance < 1300) {
                            gridsNearby.push(checkGrid)
                        }
                    }
                    if (gridsNearby.length !== 0) { // If there are grids nearby, check the grid for possible clues to log
                        // If there are grid nearby, check how many friendly/enemy grids there are
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
                    }
                    console.log(`${gridData[i].DisplayName} added to db`)
                } catch (err) {
                    console.log(err)
                    console.log(gridData[i].Mass)
                    console.log(`${gridData[i].DisplayName}'s mass failed to round. Did not add to database.`)
                }
            } else { // If grid is found in db, just update information
                entityIDs.push(gridData[i].EntityId)
                if (check.displayName !== gridData[i].DisplayName) { // If grid is renamed
                    await serverLogModel.create({
                        guildID: guildID,
                        category: 'misc',
                        string: `[${check.factionTag}] ${check.displayName} renamed to ${gridData[i].DisplayName}`
                    })
                } //
                if (check.ownerDisplayName !== gridData[i].OwnerDisplayName) { // If ownership given or taken by another faction
                    await serverLogModel.create({
                        guildID: guildID,
                        category: 'taken',
                        string: `[${factionTag}] ${gridData[i].OwnerDisplayName} claimed [${check.factionTag}] ${check.displayName}`
                    })
                }
                // End server log messages, except jumping
                var dx = check.positionX - gridData[i].Position.X;
                var dy = check.positionY - gridData[i].Position.Y;
                var dz = check.positionZ - gridData[i].Position.Z;

                let distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                if (distance > 30000) { // Assume jump drive used if grid has traveled more than 30,000m since last query
                    await serverLogModel.create({
                        guildID: guildID,
                        category: 'jumped',
                        string: `[${factionTag}] ${gridData[i].DisplayName} jumped ${Math.round(distance).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}m`
                    })
                }
                try {

                    check.displayName = gridData[i].DisplayName
                    check.blocksCount = gridData[i].BlocksCount
                    check.mass = Math.round(gridData[i].Mass)
                    check.positionX = gridData[i].Position.X
                    check.positionY = gridData[i].Position.Y
                    check.positionZ = gridData[i].Position.Z
                    check.linearSpeed = gridData[i].LinearSpeed
                    check.distanceToPlayer = gridData[i].DistanceToPlayer
                    check.ownerDisplayName = gridData[i].OwnerDisplayName
                    check.isPowered = gridData[i].IsPowered
                    check.PCU = gridData[i].PCU
                    check.expirationTime = expiration_time
                    check.factionTag = factionTag
                    check.save()
                } catch (err) {
                    console.log(`${gridData[i].DisplayName}'s mass failed to round. Did not update database.`)
                    console.log(err)
                    console.log(gridData[i].Mass)
                }
            }
            // After adding/updating database, check grid for hoover settings, manage cleanup queue
            let deletionUpdated = false;
            if (hooverSettings !== null && hooverSettings !== undefined) {
                if (hooverSettings.hooverEnabled === true) {
                    if (parseInt(hooverSettings.nextCleanup) < current_time) {
                        hooverTriggered = true;
                        let verDoc = null;
                        if (verificationNameCache.includes(gridData[i].OwnerDisplayName) === true) { // If verification doc is already download
                            verificationCache.forEach(verification => { // Find and set variable
                                if (verification === null) return; // Redundancy Check
                                if (verification.username === check.ownerDisplayName) { // If usernames match, store doc into current variable
                                    verDoc = verification;
                                } else return;
                            })
                        } else { // If verification doc is not downloaded, check for it
                            verDoc = await verificationModel.findOne({
                                username: gridData[i].OwnerDisplayName
                            })
                            if (verDoc !== null) { // If verdoc found, set variable and add to cache
                                verificationCache.push(verDoc);
                                verificationNameCache.push(check.ownerDisplayName);
                            }
                        } // Continue to check hoover cleanup


                        if (check.queuedForDeletion === false && gridData[i].GridSize === 'Large' && hooverSettings.largeGridAllowed === false) {
                            check.deletionReason = 'large grids not allowed'
                            check.queuedForDeletion = true;
                            check.deletionTime = current_time + 86400000;
                            deletionUpdated = true
                            if (verDoc !== null) {
                                let memberTarget = guild.members.cache.find(member => member.id === verDoc.userID)
                                try {
                                    memberTarget.send(`**__Warning__**\n>>> ${check.displayName} has been deleted.\nLarge grids are not allowed.`)
                                } catch(err) {}
                            }
                        }
                        if (check.queuedForDeletion === false && gridData[i].GridSize === 'Small' && hooverSettings.smallGridAllowed === false) {
                            check.deletionReason = 'small grids not allowed'
                            check.queuedForDeletion = true;
                            check.deletionTime = current_time + 86400000;
                            deletionUpdated = true
                            if (verDoc !== null) {
                                let memberTarget = guild.members.cache.find(member => member.id === verDoc.userID)
                                try {
                                    memberTarget.send(`**__Warning__**\n>>> ${check.displayName} has been deleted.\nSmall grids are not allowed.`)
                                } catch(err) {}
                            }
                        }
                        if (check.queuedForDeletion === false && check.blocksCount < parseInt(hooverSettings.blockThreshold) && NPCGridNames.includes(gridData[i].DisplayName) === false && NPCNames.includes(gridData[i].OwnerDisplayName) === false) {
                            check.deletionReason = 'less than block threshold'
                            check.queuedForDeletion = true;
                            check.deletionTime = current_time + 86400000;
                            deletionUpdated = true
                            if (verDoc !== null) {
                                let memberTarget = guild.members.cache.find(member => member.id === verDoc.userID)
                                try {
                                    memberTarget.send(`**__Warning__**\n>>> ${check.displayName} is less than ${hooverSettings.blockThreshold} blocks.\nIncrease the build size within 24hrs or the grid will be removed!`)
                                } catch(err) {}
                            }
                        }
                        if (check.queuedForDeletion === false && gridData[i].IsPowered === false && hooverSettings.unpoweredGridRemoval === true && NPCNames.includes(gridData[i].OwnerDisplayName) === false) {
                            check.deletionReason = 'unpowered'
                            check.queuedForDeletion = true;
                            check.deletionTime = current_time + 86400000;
                            deletionUpdated = true
                            if (verDoc !== null) {
                                let memberTarget = guild.members.cache.find(member => member.id === verDoc.userID)
                                try {
                                    memberTarget.send(`**__Warning__**\n>>> ${check.displayName} has run out of power.\nRestore power within 24hrs or the grid will be removed!`)
                                } catch(err) {}
                            }
                        }
                        // Unfinished
                        if (hooverSettings.cleanUnverifiedPlayerGrids === true) { // If unverified cleanup is enabled
                            if (verDoc === null && check.queuedForDeletion === false) { // If verdoc is not found, and grid is not already queued for deletion
                                if (check.queuedForDeletion === false && NPCNames.includes(gridData[i].OwnerDisplayName) === false) {
                                    if (check.ownerDisplayName === '') {
                                        check.deletionReason = 'no clear owner'
                                        check.queuedForDeletion = true;
                                        check.deletionTime = current_time + 86400000;
                                        deletionUpdated = true
                                    } else {
                                        check.deletionReason = 'unverified player grid'
                                        check.queuedForDeletion = true;
                                        check.deletionTime = current_time + 86400000;
                                        deletionUpdated = true
                                    }
                                }
                            } else if (verDoc !== null) {
                                // If there is a verification doc, try to see if they are still in the discord.
                                let memberTarget = await guild.members.cache.get(verDoc.userID);
                                if (memberTarget === null || memberTarget === undefined) {
                                    check.deletionReason = 'player left the discord'
                                    check.queuedForDeletion = true;
                                    check.deletionTime = current_time + 86400000;
                                    deletionUpdated = true
                                } // Discord check end
                            }
                        }
                        //
                        
                    }

                }
            }
            if (deletionUpdated === true) { // Only save if doc was updated with new deletion settings
                try { // Double Doc Save Catch
                    await check.save();
                } catch(err) {};
            }
        }
        
        if (hooverTriggered === true) {
            hooverSettings.nextCleanup = current_time + parseInt(hooverSettings.cleanupInterval);
            try {
                await hooverSettings.save();
            } catch (err) {}
        }
        let discordSettings = await discordSettingsModel.findOne({ // Double check before deleting documents
            guildID: guildID
        })
        if (discordSettings === null) return;
        let serverOnline = discordSettings.serverOnline;
        if (serverOnline === false) return; // Continue to delete documents
        const documents = await gridModel.find({
            guildID: guildID
        });
        documents.forEach(async doc => { // Attempt to find clues to log
            if (doc.expirationTime < current_time) {
                if (entityIDs.includes(doc.entityID) === false) {
                    let gridsNearby = [];
                    let gridsDangerClose = [];
                    for (let i = 0; i < gridDocsCache.length; i++) {
                        let checkGrid = gridDocsCache[i];
                        var dx = checkGrid.positionX - doc.positionX;
                        var dy = checkGrid.positionY - doc.positionY;
                        var dz = checkGrid.positionZ - doc.positionZ;

                        let distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                        if (distance < 900) {
                            gridsDangerClose.push(checkGrid)
                        }
                        if (distance < 1750) {
                            gridsNearby.push(checkGrid)
                            // If this close and doc is ready to delete, check if there is a player to reward currency
                            if(NPCNames.includes(doc.ownerDisplayName) === true) {
                                NPCDeathRewarder(guildID, client, doc)
                            }
                        }
                    }
                    if (gridsNearby.length !== 0) { // If there are grids nearby, check the grid for possible clues to log
                        // If there is an enemy ship nearby, check if there is an enemy
                        let enemyGridsFound = 0;
                        let friendlyGridsFound = 0;
                        let enemyFactionTag;
                        for (let a = 0; a < gridsNearby.length; a++) {
                            let grid = gridsNearby[a];
                            if (grid.factionTag !== doc.factionTag) { // If grid facTag does not match the target grid facTag
                                enemyGridsFound += 1;
                                enemyFactionTag = grid.factionTag // Set the enemy facTag
                            } else {
                                friendlyGridsFound += 1;
                            }
                        }
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
                    try {
                        doc.remove()
                    } catch (err) {
                        console.log('Grid database remove error caught')
                    }
                    return console.log(`${doc.displayName} Grid expired`)
                }

            }
        })
    }

    return;
}