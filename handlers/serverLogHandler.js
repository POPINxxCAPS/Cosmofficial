const serverLogModel = require('../models/serverLogSchema');
const serverLogSettingModel = require('../models/serverLogSettingSchema');
const discordServerSettingsModel = require('../models/discordServerSettngsSchema');

module.exports = async (client, discord) => {
    let guildIDs = await client.guilds.cache.map(guild => guild.id);
    const mainGuild = client.guilds.cache.get("853247020567101440");
    // Interval to check for new discords
    setInterval(async () => {
        guildIDs = await client.guilds.cache.map(guild => guild.id);
    }, 300000)
    // Status Query
    setInterval(() => {
        guildIDs.forEach(async guildID => {
            const guild = client.guilds.cache.get(guildID);
            if (guild === undefined || guild === null) return; // If bot is no longer in guild

            let patron;
            if (guild.owner === null) return; // Redundancy Check
            let guildOwner = mainGuild.members.cache.get(guild.owner.user.id);
            if (!guildOwner) return; // If guild owner is no longer in Cosmofficial discord

            if (guildOwner.roles.cache.has('883534965650882570') || guildOwner.roles.cache.has('883535930630213653')) {
                patron = true;
            }
            // if (patron !== true) return; // Disabled, server log feature is meant to be free
            let settings = await serverLogSettingModel.findOne({
                guildID: guildID
            });
            if (settings === null) {
                let serverLogs = await serverLogModel.find({
                    guildID: guildID
                })
                serverLogs.forEach(log => {
                    log.remove();
                })
                return;
            }

            let discordSettings = await discordServerSettingsModel.findOne({
                guildID: guildID
            })
            if (discordSettings.serverLogChannel === null) {
                let serverLogs = await serverLogModel.find({
                    guildID: guildID
                })
                serverLogs.forEach(log => {
                    log.remove();
                })
                return;
            }

            const channel = client.channels.cache.get(discordSettings.serverLogChannel);
            if (channel === null || channel === undefined) {
                let serverLogs = await serverLogModel.find({
                    guildID: guildID
                })
                serverLogs.forEach(log => {
                    log.remove();
                })
                return;
            }

            let loggedInOutString = '';
            let removedByBotString = '';
            let createdByPlayerString = '';
            let dockedString = '';
            let destroyedString = '';
            let jumpedString = '';
            let damagedString = '';
            let characterString = '';
            let miscString = '';
            let takenString = '';
            let createdString = '';
            let npcString = '';

            let serverLogs = await serverLogModel.find({
                guildID: guildID
            })
            if (serverLogs.length === 0) return;

            serverLogs.forEach(log => {
                if (log.category === 'loggedInOut') {
                    if(loggedInOutString.length > 900) {} else {
                    loggedInOutString += `${log.string}\n`
                    log.remove()
                    return;                        
                    }
                }
                if (log.category === 'removedByBot') {
                    if(removedByBotString.length > 900) {} else {
                    removedByBotString += `${log.string}\n`
                    log.remove()
                    return;                        
                    }
                }
                if (log.category === 'createdByPlayer') {
                    if(createdByPlayerString.length > 900) {} else {
                    createdByPlayerString += `${log.string}\n`
                    log.remove()
                    return;                        
                    }
                }
                if (log.category === 'docked') {
                    if(dockedString.length > 900) {} else {
                    dockedString += `${log.string}\n`
                    log.remove()
                    return;                        
                    }
                }
                if (log.category === 'destroyed') {
                    if(destroyedString.length > 900) {} else {
                    destroyedString += `${log.string}\n`
                    log.remove()
                    return;                        
                    }
                }
                if (log.category === 'jumped') {
                    if(jumpedString.length > 900) {} else {
                    jumpedString += `${log.string}\n`
                    log.remove()
                    return;                        
                    }
                }
                if (log.category === 'damaged') {
                    if(damagedString.length > 900) {} else {
                    damagedString += `${log.string}\n`
                    log.remove()
                    return;
                    }
                }
                if (log.category === 'character') {
                    if(characterString.length > 900) {} else {
                    characterString += `${log.string}\n`
                    log.remove()
                    return;
                    }
                }
                if (log.category === 'misc') {
                    if(miscString.length > 900) {} else {
                    miscString += `${log.string}\n`
                    log.remove()
                    return;
                    }
                }
                if (log.category === 'taken') {
                    if(takenString.length > 900) {} else {
                    takenString += `${log.string}\n`
                    log.remove()
                    return;
                    }
                }
                if (log.category === 'created') {
                    if(createdString.length > 900) {} else {
                    createdString += `${log.string}\n`
                    log.remove()
                    return;
                    }
                }
                if (log.category === 'npc') {
                    if(npcString.length > 900) {} else {
                    npcString += `${log.string}\n`
                    log.remove()
                    return;
                    }
                }
            })


            const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle('Server Log')
            .setURL('https://www.patreon.com/Cosmofficial')
            .setFooter('Cosmofficial by POPINxxCAPS');

            if (loggedInOutString !== '') {
                embed.addFields({
                    name: 'Logged In/Out',
                    value: `${loggedInOutString}`
                })
            }
            if (removedByBotString !== '') {
                embed.addFields({
                    name: 'Removed by Bot Hoover',
                    value: `${removedByBotString}`
                })
            }
            if (createdByPlayerString !== '') {
                embed.addFields({
                    name: 'Created by Player',
                    value: `${createdByPlayerString}`
                })
            }
            if (dockedString !== '') {
                embed.addFields({
                    name: 'Docked/Connected',
                    value: `${dockedString}`
                })
            }
            if (destroyedString !== '') {
                embed.addFields({
                    name: 'Grid Destroyed',
                    value: `${destroyedString}`
                })
            }
            if (jumpedString !== '') {
                embed.addFields({
                    name: 'Used Jump Drive',
                    value: `${jumpedString}`
                })
            }
            if (damagedString !== '') {
                embed.addFields({
                    name: 'Damaged',
                    value: `${damagedString}`
                })
            }
            if (characterString !== '') {
                embed.addFields({
                    name: 'Player Died/Spawned',
                    value: `${characterString}`
                })
            }
            if (miscString !== '') {
                embed.addFields({
                    name: 'Miscellaneous',
                    value: `${miscString}`
                })
            }
            if (takenString !== '') {
                embed.addFields({
                    name: 'Grid Ownership Transferred',
                    value: `${takenString}`
                })
            }
            if (createdString !== '') {
                embed.addFields({
                    name: 'Grid Created',
                    value: `${createdString}`
                })
            }
            if (npcString !== '') {
                embed.addFields({
                    name: 'NPC Spawned/Despawned',
                    value: `${npcString}`
                })
            }

            channel.send(embed)
        })


    }, 60000);


}