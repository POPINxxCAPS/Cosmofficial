const playerModel = require('../../models/playerSchema');
let playerEcoModel = require('../../models/playerEcoSchema');
const whitelistModel = require('../../models/whitelistSchema');
const whitelistSettingModel = require('../../models/whitelistSettingSchema');
const banModel = require('../../models/banSchema');
const serverLogModel = require('../../models/serverLogSchema');
const queryPlayers = require('../execution/queryPlayers');
const timerFunction = require('../database/timerFunction');

module.exports = async (req) => {
    const guildID = req.guildID;
    const config = req.config;
    const settings = req.settings;
    const client = req.client;
    const verificationCache = req.verDocs
    const ecoSettings = req.ecoSettings;
    const currencyName = ecoSettings.currencyName;
    let onlinePlayerReward = ecoSettings.onlineReward;
    if(onlinePlayerReward === "Not Set") onlinePlayerReward = 0;
    let insertData = [];
    let SLinsertData = [];
    const statusDoc = req.statusDoc; // Confirm server is being reported as online before attempting query
    if (statusDoc === null || statusDoc.serverOnline === false || statusDoc.serverOnline === undefined) return null;
    req.expirationInSeconds = (req.gridQueryDelay / 2) / 1000 || 30;
    if (req.expirationInSeconds < 30) req.expirationInSeconds = 30;
    req.name = 'logPlayers'
    const timerCheck = await timerFunction(req)
    if (timerCheck === true) return; // If there is a timer, cancel.
    const guild = await client.guilds.cache.get(guildID) || await client.guilds.cache.get("799685703910686720");
    const mainGuild = await client.guilds.cache.get("853247020567101440");
    if (guild === null || mainGuild === null || guild.owner === null) return; // Redundancy Crash Check

    const playerData = await queryPlayers(config)

    let whitelistedPlayers = [];
    let onlinePlayerGTs = [];
    const banDocuments = await banModel.find({
        guildID: guild.id
    })
    let bannedSteamIDs = [];
    for(const doc of banDocuments) {
        bannedSteamIDs.push(doc.steamID);
    }
    let whitelistSettings = await whitelistSettingModel.findOne({
        guildID: guild.id
    })
    if (whitelistSettings === null) {
        whitelistSettings = await whitelistSettingModel.create({
            guildID: guild.id,
            enabled: false
        })
    }
    if (playerData === undefined) return;
    if (whitelistSettings.enabled === true) {
        let whitelistDocs = await whitelistModel.find({
            guildID: guild.id
        })

        for (let i = 0; i < whitelistDocs.length; i++) {
            whitelistedPlayers.push(whitelistDocs[i].username)
        }
    }




    let time = Date.now();
    for (let i = 0; i < playerData.length; i++) {
        const player = playerData[i];
        if (player.DisplayName === '') continue;;
        onlinePlayerGTs.push(player.DisplayName);
        let playerDoc = await playerModel.findOne({
            guildID: guildID,
            steamID: player.SteamID
        })
        if (playerDoc === null || playerDoc === undefined) {
            playerDoc = {
                guildID: guildID,
                steamID: player.SteamID,
                displayName: player.DisplayName,
                factionName: player.FactionName,
                factionTag: player.FactionTag,
                promoteLevel: player.PromoteLevel,
                ping: player.Ping,
                online: true,
                lastLogin: `${time}`,
                lastLogout: '0',
                loginHistory: []
            }
            insertData.push(playerDoc)
        } else {
            if (playerDoc.online === true) { // Player was already logged in
                if (playerDoc.factionTag !== player.FactionTag && player.FactionTag !== '') { // Check if a new faction was created
                    let tempDocs = await playerModel.find({
                        guildID: guildID,
                        factionTag: player.FactionTag
                    })
                    if (tempDocs.length === 0) { // If there are no other players with that tag, assume faction creation
                        await serverLogModel.create({
                            guildID: guildID,
                            category: 'misc',
                            string: `${player.DisplayName} created faction: ${player.FactionTag}.`
                        })
                    }
                    if (tempDocs.length > 0) { // If there are other players with that tag, assume faction join
                        await serverLogModel.create({
                            guildID: guildID,
                            category: 'misc',
                            string: `${player.DisplayName} joined faction: ${player.FactionTag}.`
                        })
                    }
                }
                if (playerDoc.factionTag !== player.FactionTag && player.FactionTag === '') { // Assume faction left
                    await serverLogModel.create({
                        guildID: guildID,
                        category: 'misc',
                        string: `${player.DisplayName} left faction: ${playerDoc.factionTag}.`
                    })
                }
                playerDoc.displayName = player.DisplayName;
                playerDoc.factionName = player.FactionName;
                playerDoc.factionTag = player.FactionTag;
                playerDoc.promoteLevel = player.PromoteLevel;
                playerDoc.ping = player.Ping;
                playerDoc.save();
            } else { // Player just logged in
                if (playerDoc.factionTag !== player.FactionTag && player.FactionTag !== '') { // Check if a new faction was created
                    let tempDocs = await playerModel.find({
                        guildID: guildID,
                        factionTag: playerDoc.factionTag
                    })
                    if (tempDocs.length === 0) { // If there are no other players with that tag, assume faction creation
                        await serverLogModel.create({
                            guildID: guildID,
                            category: 'misc',
                            string: `${player.DisplayName} created faction: ${player.FactionTag}.`
                        })
                    }
                    if (tempDocs.length > 0) { // If there are other players with that tag, assume faction join
                        await serverLogModel.create({
                            guildID: guildID,
                            category: 'misc',
                            string: `${player.DisplayName} joined faction: ${player.FactionTag}.`
                        })
                    }
                }
                if (playerDoc.factionTag !== player.FactionTag && player.FactionTag === '') { // Assume faction left
                    await serverLogModel.create({
                        guildID: guildID,
                        category: 'misc',
                        string: `${player.DisplayName} kicked from faction: ${playerDoc.factionTag}.`
                    })
                }
                playerDoc.displayName = player.DisplayName;
                playerDoc.factionName = player.FactionName;
                playerDoc.factionTag = player.FactionTag;
                playerDoc.promoteLevel = player.PromoteLevel;
                playerDoc.ping = player.Ping;
                playerDoc.online = true;
                playerDoc.lastLogin = `${time}`;
                playerDoc.save();

                await serverLogModel.create({
                    guildID: guildID,
                    category: 'loggedInOut',
                    string: `${player.DisplayName} logged in.`
                })

            }
        } // End of player doc creation/updating

        // Whitelist check
        if (whitelistSettings.enabled === true) {
            if (whitelistedPlayers.includes(player.DisplayName) === false) {
                await send('POST', `${adminPath}/kickedPlayers/${player.SteamID}`)
                console.log(player.SteamID)
                console.log('Removed player from server due to whitelist.')
            }
            continue;
        }

        // Banned Player Check
        if(bannedSteamIDs.includes(player.SteamID) === true) {
            await send('POST', `${adminPath}/kickedPlayers/${player.SteamID}`);
            continue;
        }

        // Start of online player reward system
        let verificationDoc = verificationCache.find(cache => cache.username === player.DisplayName)
        if (verificationDoc !== null && verificationDoc !== undefined) {
            let playerEcoDoc = await playerEcoModel.findOne({
                guildID: guild.id,
                userID: verificationDoc.userID
            })
            if (playerEcoDoc === null) continue;
            // If player eco doc found, update telemetry and reward with tokens
            let rewardModifier = 1; // Future use with quests + alliance bonuses
            let rewardAmount = Math.round(((onlinePlayerReward * req.expirationInSeconds) * rewardModifier))
            console.log(`${verificationDoc.username} Given ${rewardAmount} with ${rewardModifier} reward modifier`)

            let statFound = false;
            // Stat tracking stuff for future use. Ugly, but works
            for (let s = 0; s < playerEcoDoc.statistics.length; s++) {
                if (playerEcoDoc.statistics[s].name === 'OnlineRewardReceived') {
                    playerEcoDoc.statistics[s].value = Number(playerEcoDoc.statistics[s].value) + rewardAmount;
                    statFound = true;
                }
            }
            if (statFound === false) {
                playerEcoDoc.statistics.push({
                    name: 'OnlineRewardReceived',
                    value: `${rewardAmount}`
                })
            }
            playerEcoDoc.currency = Math.round(Number(playerEcoDoc.currency) + Math.round((onlinePlayerReward * rewardModifier * 60)));
            playerEcoDoc.save();


        }
    }
    await playerModel.insertMany(insertData);


    // Update offline players
    let playerDocs = await playerModel.find({
        guildID: guild.id,
        online: true
    });
    playerDocs.forEach(async doc => {
        if (onlinePlayerGTs.includes(doc.displayName) || doc.online === false) return;
        let current_time = Date.now();
        doc.lastLogout = current_time;
        doc.loginHistory.push({
            login: doc.lastLogin,
            logout: current_time
        })
        doc.online = false;
        doc.save();

        let SLdoc = {
            guildID: guildID,
            category: 'loggedInOut',
            string: `${doc.displayName} logged out.`
        }
        SLinsertData.push(SLdoc);
    })

    await serverLogModel.insertMany(SLinsertData)

    return;
}