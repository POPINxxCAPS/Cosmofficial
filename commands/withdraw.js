let playerEcoModel = require('../models/playerEcoSchema');
const lockedEmbed = require('../functions_discord/lockedEmbed');
module.exports = {
    name: 'withdraw',
    aliases: ['with'],
    description: "Withdraw currency from your vault.",
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

        let amount;
        if (args[0] === 'all') {
            amount = parseInt(playerEco.vault)
        } else {
            amount = parseInt(args[0]);
        }
        if (amount % 1 != 0 || amount <= 0) return message.reply("Withdraw amount must be a whole number");
        if (amount > playerEco.vault) return message.reply(`Insuffient ${currencyName}. Transaction failed.`);
        playerEco.currency = parseInt(playerEco.currency) + amount;
        playerEco.vault = parseInt(playerEco.vault) - amount;
        playerEco.save();



        const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle(`Economy Manager`)
            .setURL('https://cosmofficial.herokuapp.com/')
            .setDescription(`<@${message.author.id}> withdrew **${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ${currencyName}** from their vault.`)
            .setFooter('Cosmofficial by POPINxxCAPS');

        return message.channel.send(embed);
    }
}