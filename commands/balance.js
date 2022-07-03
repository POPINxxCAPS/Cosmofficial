let playerEcoModel = require('../models/playerEcoSchema');
const errorEmbed = require('../functions/discord/errorEmbed');
module.exports = {
    name: 'balance',
    aliases: ['bal'],
    description: "Check your economy balances.\nOr, *c!bal @player* to check their balances.",
    permissions: ["SEND_MESSAGES"],
    category: "Economy",
    categoryAliases: ['economy', 'eco'],
    async execute(req) {
        const message = req.message;
        const args = req.args;
        const discord = req.discord;
        const mainGuild = req.mainGuild;
        const guild = req.guild;
        let playerEco = req.playerEco;

        const ecoSettings = req.ecoSettings;
        const currencyName = ecoSettings.currencyName;

        if (args.length) {
            const target = message.mentions.users.first();
            if (!target) return errorEmbed(message.channel, 'Invalid argument. Valid: @username')
            const targetData = await playerEcoModel.findOne({
                userID: target.id,
                guildID: guild.id
            });
            if (!targetData) return errorEmbed(message.channel, 'User not found in the database.')
            const balEmbed = new discord.MessageEmbed()
                .setColor('#E02A6B')
                .setTitle(`Economy Manager`)
                .setURL('https://cosmofficial.herokuapp.com/')
                .setDescription(`**Balance of User:** <@${target.id}>`)
                .addFields({
                    name: `${currencyName}`,
                    value: `${parseInt(targetData.currency).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
                }, {
                    name: 'Vault',
                    value: `${parseInt(targetData.vault).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
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
                value: `${playerEco.currency.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
            }, {
                name: 'Vault',
                value: `${playerEco.vault.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
            }, )
            .setFooter('Cosmofficial by POPINxxCAPS');

        message.channel.send(balEmbed);

    }
}