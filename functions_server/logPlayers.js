const playerModel = require('../models/playerSchema');
const playerEcoModel = require('../models/playerEcoSchema');
const economySettingModel = require('../models/economySettingSchema');
const verificationModel = require('../models/verificationSchema');
const whitelistModel = require('../models/whitelistSchema');
const whitelistSettingModel = require('../models/whitelistSettingSchema');
const serverLogModel = require('../models/serverLogSchema');
const queryPlayers = require('../functions_execution/queryPlayers');
const timerFunction = require('../functions_db/timerFunction')

module.exports = async (req) => {
    const guildID = req.guildID;
    const config = req.config;
    const settings = req.settings;
    const client = req.client;
    if(settings.serverOnline === false || settings.serverOnline === undefined) return;
    req.expirationInSeconds = 60;
    req.name = 'logPlayers'
    const timerCheck = await timerFunction(req)
    if (timerCheck === true) return; // If there is a timer, cancel.
    const guild = client.guilds.cache.get(guildID);
    const mainGuild = client.guilds.cache.get("853247020567101440");

    // Economy Settings
    let patron;
    let guildOwner = mainGuild.members.cache.get(guild.owner.user.id);
    if (!guildOwner) return; // If guild owner is no longer in Cosmofficial discord

    if (guildOwner.roles.cache.has('883535930630213653') || guildOwner.roles.cache.has('883534965650882570')) {
        patron = true;
    }
    let onlinePlayerReward = 0;

    if (patron === true) {
        let ecoSettings = await economySettingModel.findOne({
            guildID: guildID
        })
        if (ecoSettings !== null) {
            ecoSettings.settings.forEach(setting => {
                if (setting.name === 'OnlinePlayerReward') {
                    onlinePlayerReward = Math.round(parseFloat(setting.value));
                }
            })
        }
    }

    const playerData = await queryPlayers(config)

    let whitelistedPlayers = [];
    let onlinePlayerGTs = [];
    if (playerData !== undefined) {
        let whitelistSettings;
        if (patron === true) {
            whitelistSettings = await whitelistSettingModel.findOne({
                guildID: guild.id
            })
            if (whitelistSettings === null) {
                whitelistSettings = await whitelistSettingModel.create({
                    guildID: guild.id,
                    enabled: false
                })
            }
            if (whitelistSettings.enabled === true) {
                let whitelistDocs = await whitelistModel.find({
                    guildID: guild.id
                })

                for(let i = 0; i < whitelistDocs.length; i++) {
                whitelistedPlayers.push(whitelistDocs[i].username)
                }
            }
        }




        let time = Date.now();
        await playerData.forEach(async player => {
            if (player.DisplayName === '') return;
            onlinePlayerGTs.push(player.DisplayName);
            let playerDoc = await playerModel.findOne({
                guildID: guildID,
                steamID: player.SteamID
            })
            if (playerDoc === null || playerDoc === undefined) {
                playerModel.create({
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
                })
            } else {
                if (playerDoc.online === true) { // Player was already logged in
                    if(playerDoc.factionTag !== player.FactionTag  && player.FactionTag !== '') { // Check if a new faction was created
                        let tempDocs = await playerModel.find({
                            guildID: guildID,
                            factionTag: player.FactionTag
                        })
                        if(tempDocs.length === 0) { // If there are no other players with that tag, assume faction creation
                            await serverLogModel.create({
                                guildID: guildID,
                                category: 'misc',
                                string: `${player.DisplayName} created faction: ${player.FactionTag}.`
                            })
                        }
                        if(tempDocs.length > 0) { // If there are other players with that tag, assume faction join
                            await serverLogModel.create({
                                guildID: guildID,
                                category: 'misc',
                                string: `${player.DisplayName} joined faction: ${player.FactionTag}.`
                            })
                        }
                    }
                    if(playerDoc.factionTag !== player.FactionTag  && player.FactionTag === '') { // Assume faction left
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
                    if(playerDoc.factionTag !== player.FactionTag  && player.FactionTag !== '') { // Check if a new faction was created
                        let tempDocs = await playerModel.find({
                            guildID: guildID,
                            factionTag: playerDoc.factionTag
                        })
                        if(tempDocs.length === 0) { // If there are no other players with that tag, assume faction creation
                            await serverLogModel.create({
                                guildID: guildID,
                                category: 'misc',
                                string: `${player.DisplayName} created faction: ${player.FactionTag}.`
                            })
                        }
                        if(tempDocs.length > 0) { // If there are other players with that tag, assume faction join
                            await serverLogModel.create({
                                guildID: guildID,
                                category: 'misc',
                                string: `${player.DisplayName} joined faction: ${player.FactionTag}.`
                            })
                        }
                    }
                    if(playerDoc.factionTag !== player.FactionTag  && player.FactionTag === '') { // Assume faction left
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
            if (patron === true) {
                if (whitelistSettings.enabled === true) {
                    if (whitelistedPlayers.includes(player.DisplayName) === false) {
                        await send('POST', `${adminPath}/kickedPlayers/${player.SteamID}`)
                        console.log(player.SteamID)
                        console.log('Removed player from server due to whitelist.')
                    }
                }
            }


            // Start of online player reward system

            if (patron === true) {
                let verificationDoc = await verificationModel.findOne({
                    username: player.DisplayName
                })
                if (verificationDoc !== null) {
                    let playerEcoDoc = await playerEcoModel.findOne({
                        guildID: guildID,
                        userID: verificationDoc.userID
                    })
                    if (playerEcoDoc !== null) {
                        // If player eco doc found, update telemetry and reward with tokens
                        let rewardModifier = 1;
                        let memberTarget = guild.members.cache.find(member => member.id === verificationDoc.userID);
                        let memberTargetMainGuild = mainGuild.members.cache.find(member => member.id === verificationDoc.userID);
                        if (memberTarget === null || memberTarget === undefined) {} else {
                            if (memberTarget.roles.cache.has('853949230350991392')) {
                                rewardModifier += .35
                            }
                            if (memberTarget.roles.cache.has('853947102521851914')) {
                                rewardModifier += .7
                            }
                            if (memberTarget.roles.cache.has('847648987933835285')) {
                                rewardModifier += 1.15
                            }
                        }
                        if (memberTargetMainGuild === null || memberTargetMainGuild === undefined) {} else {
                            if (memberTargetMainGuild.roles.cache.has('883564759541243925')) {
                                rewardModifier += .35
                            }
                            if (memberTargetMainGuild.roles.cache.has('883563886815617025')) {
                                rewardModifier += .7
                            }
                            if (memberTargetMainGuild.roles.cache.has('883564396587147275')) {
                                rewardModifier += 1.15
                            }
                        }
                        let rewardAmount = Math.round(((onlinePlayerReward * 60) * rewardModifier))
                        console.log(`${verificationDoc.username} Given ${rewardAmount} with ${rewardModifier} reward modifier`)

                        let statFound = false;
                        playerEcoDoc.statistics.forEach(stat => {
                            if (stat.name === 'OnlineRewardReceived') {
                                stat.value = Number(stat.value) + rewardAmount;
                                statFound = true;
                            }
                        })
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

            }
        })









        // Update offline players
        setTimeout(async () => {
            let playerDocs = await playerModel.find({
                guildID: guildID
            });
            playerDocs.forEach(async doc => {
                if (onlinePlayerGTs.includes(doc.displayName) || doc.online === false) {} else {
                    let current_time = Date.now();
                    doc.lastLogout = current_time;
                    doc.loginHistory.push({
                        login: doc.lastLogin,
                        logout: current_time
                    })
                    doc.online = false;
                    doc.save();

                    await serverLogModel.create({
                        guildID: guildID,
                        category: 'loggedInOut',
                        string: `${doc.displayName} logged out.`
                    })
                }
            })
        }, 10000);
    }
    return;
}