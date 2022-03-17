let playerEcoModel = require('../models/playerEcoSchema');
const errorEmbed = require('../functions_discord/errorEmbed');
module.exports = {
    name: 'balance',
    aliases: ['bal'],
    description: "Check your economy balances.\mOr, *c!bal @player* to check their balances.",
    permissions: ["SEND_MESSAGES"],
    category: "Economy",
    async execute(req) {
        const message = req.message;
        const args = req.args;
        const discord = req.discord;
        const mainGuild = req.mainGuild;
        let playerEco = req.playerEco;

        const ecoSettings = req.ecoSettings;
        const currencyName = ecoSettings.currencyName;

        if (args.length) {
            const target = message.mentions.users.first();
            if (!target) return errorEmbed(message.channel, 'Invalid argument. Valid: @username')
            const targetData = await playerEcoModel.findOne({
                userID: target.id
            });
            if (!targetData) return errorEmbed(message.channel, 'User not found in the database.')
            const balEmbed = new discord.MessageEmbed()
                .setColor('#E02A6B')
                .setTitle(`Economy Manager`)
                .setURL('https://cosmofficial.herokuapp.com/')
                .setDescription(`**Balance of User:** <@${target.id}>`)
                .addFields({
                    name: `${currencyName}`,
                    value: `${targetData.currency}`
                }, {
                    name: 'Vault',
                    value: `${targetData.vault}`
                }, )
                .setFooter('Cosmofficial by POPINxxCAPS');
            message.delete().catch(err => {})
            return message.channel.send(balEmbed)
        }
        if (!parseInt(playerEco.currency)) {
            playerEco.currency = 0;
        }
        if (!parseInt(playerEco.vault)) {
            playerEco.vault = 0;
        }
        playerEco.currency = Math.round(playerEco.currency)
        playerEco.vault = Math.round(playerEco.vault)
        playerEco.save();
        const balEmbed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle(`Economy Manager`)
            .setURL('https://cosmofficial.herokuapp.com/')
            .setDescription(`**Balance of User:** <@${message.author.id}>`)
            .addFields({
                name: `${currencyName}`,
                value: `${playerEco.currency}`
            }, {
                name: 'Vault',
                value: `${playerEco.vault}`
            }, )
            .setFooter('Cosmofficial by POPINxxCAPS');

        message.channel.send(balEmbed);

    }
}