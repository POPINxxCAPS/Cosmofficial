const playerModel = require('../models/playerSchema');
const discordServerSettings = require('../models/discordServerSettngsSchema');
const ms = require('ms');

module.exports = {
    name: 'faction',
    aliases: ['faction'],
    description: "List online players",
    permissions: ["SEND_MESSAGES"],
    async execute(message, args, cmd, client, discord, mainGuild, guild) {
        let current_time = Date.now();

        // Check if owner has adminstration package
        let guildOwner = mainGuild.members.cache.get(message.guild.owner.user.id);
        if (!guildOwner || guildOwner === null || guildOwner === undefined) return message.channel.send('The owner of this discord must be in the Cosmofficial discord to enable usage of this command.');
        let adminstrationPackage;
        if (guildOwner.roles.cache.has('883535682553929779') || guildOwner.roles.cache.has('883535930630213653') || guildOwner.roles.cache.has('883534965650882570')) {
            administrationPackage = true;
        } else {
            administrationPackage = false;
        }

        if (administrationPackage === true) {
            let playerDocs = await playerModel.find({
                guildID: guild.id,
                factionTag: args[0]
            });
            if (playerDocs === null || playerDocs.length === 0 || playerDocs === undefined) {
                playerDocs = await playerModel.find({
                    guildID: guild.id,
                    factionName: args[0]
                });
            }
            if (playerDocs === null || playerDocs.length === 0 || playerDocs === undefined) {
                playerDocs = await playerModel.findOne({
                    guildID: guild.id,
                    displayName: args[0],
                });
                if(playerDocs !== null) {
                    playerDocs = await playerModel.find({
                        guildID: guild.id,
                        factionName: playerDocs.factionName,
                    }); 
                }
            }
            if (playerDocs === null || playerDocs.length === 0 || playerDocs === undefined) {
                const embed = new discord.MessageEmbed()
                    .setColor('#E02A6B')
                    .setTitle('Faction Info')
                    .setURL('https://mod.io/members/popinuwu')
                    .setFooter('Cosmofficial by POPINxxCAPS')
                    .addFields({
                        name: 'Faction not found!',
                        value: 'Try a different faction tag or name.\nFormat: c!faction {name/tag}'
                    })
                return message.channel.send(embed);
            }


            const embed = new discord.MessageEmbed()
                .setColor('#E02A6B')
                .setTitle('Faction Info')
                .setDescription(`Faction: ${playerDocs[0].factionName}`)
                .setURL('https://mod.io/members/popinuwu')
                .setFooter('Cosmofficial by POPINxxCAPS');


            playerDocs.forEach(doc => {
                let numToAvg = 0;
                doc.loginHistory.forEach(loginHisDoc => {
                    if (isNaN(loginHisDoc.logout - loginHisDoc.login)) {} else {
                        numToAvg += (loginHisDoc.logout - loginHisDoc.login)
                    }
                })
                let averageLogin;
                if (numToAvg === 0) {
                    averageLogin = 0;
                } else {
                    averageLogin = numToAvg / doc.loginHistory.length
                }
                if (doc.online === true) {
                    embed.addFields({
                        name: `${doc.displayName}`,
                        value: `Online\nAverage Playtime: ${ms(averageLogin)}`
                    })
                } else {
                    embed.addFields({
                        name: `${doc.displayName}`,
                        value: `Offline\nLast seen: ${ms((current_time - parseInt(doc.lastLogout)))} ago\nAverage Playtime: ${ms(averageLogin)}`
                    })
                }
            })

            return message.channel.send(embed)

        } else { // If no administration & data package
            let playerDocs = await playerModel.find({
                guildID: guild.id,
                factionTag: args[0]
            });
            if (playerDocs === null || playerDocs.length === 0 || playerDocs === undefined) {
                playerDocs = await playerModel.find({
                    guildID: guild.id,
                    factionName: args[0]
                });
            }
            if (playerDocs === null || playerDocs.length === 0 || playerDocs === undefined) {
                playerDocs = await playerModel.findOne({
                    guildID: guild.id,
                    displayName: args[0],
                });
                if(playerDocs !== null) {
                    playerDocs = await playerModel.find({
                        guildID: guild.id,
                        factionName: playerDocs.factionName,
                    }); 
                }
            }
            if (playerDocs === null || playerDocs.length === 0 || playerDocs === undefined) {
                const embed = new discord.MessageEmbed()
                    .setColor('#E02A6B')
                    .setTitle('Faction Info')
                    .setURL('https://mod.io/members/popinuwu')
                    .setFooter('Cosmofficial by POPINxxCAPS')
                    .addFields({
                        name: 'Faction not found!',
                        value: 'Try a different faction tag or name.\nFormat: c!faction {name/tag}'
                    })
                return message.channel.send(embed);
            }
            let playersString = '';
            for (i = 0; i < playerDocs.length; i++) {
                if (playerDocs[i].displayName !== '') {
                    playersString += `${playerDocs[i].displayName}\n`;
                }
            }
            if (playersString === '') {
                const settings = await discordServerSettings.findOne({
                    guildID: message.guild.id
                });
                if (settings.serverOnline === false) {
                    playersString = 'The server is either offline or queries have broken.'
                } else {
                    playersString = 'No players online.'
                }
            }
            const embed = new discord.MessageEmbed()
                .setColor('#E02A6B')
                .setTitle('Faction Info')
                .setDescription(`Faction: ${playerDocs[0].factionName}`)
                .setURL('https://mod.io/members/popinuwu')
                .setDescription(`Faction: ${playerDocs[0].factionName}`)
                .addFields({
                    name: 'Faction Members',
                    value: `${playersString}`
                }, )
                .setFooter('Cosmofficial by POPINxxCAPS');

            message.channel.send(embed)
        }




    }
}