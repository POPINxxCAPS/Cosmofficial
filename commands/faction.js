const playerModel = require('../models/playerSchema');
const discordServerSettings = require('../models/discordServerSettingsSchema');
const ms = require('ms');

module.exports = {
    name: 'faction',
    aliases: ['faction'],
    description: "List players in a faction.",
    permissions: ["SEND_MESSAGES"],
    category: "General",
    async execute(req) {
        const message = req.message;
        const args = req.args;
        const discord = req.discord;
        const guild = req.guild;
        let current_time = Date.now();

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
            if (playerDocs !== null) {
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
                .setURL('https://cosmofficial.herokuapp.com/')
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
            .setURL('https://cosmofficial.herokuapp.com/')
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
    }
}