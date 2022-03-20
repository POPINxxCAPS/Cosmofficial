let playerEcoModel = require('../models/playerEcoSchema');
const lockedEmbed = require('../functions/discord/lockedEmbed');
module.exports = {
    name: 'pay',
    aliases: ['pay'],
    description: "Pay a user. Currency must be un-vaulted to pay.",
    permissions: ["SEND_MESSAGES"],
    category: "Economy",
    categoryAliases: ['economy', 'eco'],
    async execute(req) {
        const message = req.message;
        const args = req.args;
        const discord = req.discord;
        const mainGuild = req.mainGuild;
        let playerEco = req.playerEco;
        const ecoSettings = req.ecoSettings;
        const currencyName = ecoSettings.currencyName;

        if (!args.length) return message.reply("You need to mention he player you want to pay.");
        const amount = parseInt(args[1], 10);
        const limit = playerEco.currency;
        const target = message.mentions.users.first();
        if (!target) return message.reply("That user does not exist");
        if (amount % 1 != 0 || amount <= 0) return message.reply("Pay amount must be a whole number");
        if (limit < amount) {
            if(playerEco.vault > amount) return message.reply(`Please withdraw your ${currencyName} from the vault.`)
            return message.reply(`Insufficient ${currencyName} available for payment. Transaction failed.`);
        } 
        try {
            let targetData = await playerEcoModel.findOne({
                guildID: message.guild.id,
                userID: target.id
            });
            if (!targetData) return message.reply(`This user doesn't exist in the database.`);
            targetData.currency = parseInt(targetData.currency) + amount;
            playerEco.currency = parseInt(playerEco.currency) - amount;
            targetData.save();
            playerEco.save();

            const embed = new discord.MessageEmbed()
                .setColor('#E02A6B')
                .setTitle(`Economy Manager`)
                .setURL('https://cosmofficial.herokuapp.com/')
                .setDescription(`<@${message.author.id}> successfully paid ${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ${currencyName} to <@${target.id}>`)
                .setFooter('Cosmofficial by POPINxxCAPS');

            return message.channel.send(embed);
        } catch (err) {
            console.log(err)
        }
    }
}