let playerEcoModel = require('../models/playerEcoSchema');
const errorEmbed = require('../functions/discord/errorEmbed');
module.exports = {
    name: "givetokens",
    aliases: ['give'],
    permissions: ["ADMINISTRATOR"],
    description: "Grants currency to the targetted player.",
    category: "Administration",
    async execute(req) {
        const message = req.message;
        const args = req.args;
        const discord = req.discord;
        const mainGuild = req.mainGuild;
        const guild = req.guild;
        const ecoSettings = req.ecoSettings;
        const currencyName = ecoSettings.currencyName;

        if (!args.length) return errorEmbed(message.channel, 'You must mention a player to give them tokens.')
        const amount = args[1];
        const target = message.mentions.users.first();
        if (!target) return errorEmbed(message.channel, 'User does not exist.');

        if (amount % 1 != 0 || amount <= 0) return errorEmbed(message.channel, 'Amount must be a whole number')

        try {
            const targetData = await playerEcoModel.findOne({
                guildID: guild.id,
                userID: target.id
            });
            if (!targetData) return errorEmbed(message.channel, 'User does not exist in database.');
            targetData.currency = parseFloat(targetData.currency) + parseFloat(args[1]);
            targetData.save();
            const embed = new discord.MessageEmbed()
                .setColor('#E02A6B')
                .setTitle(`Economy Manager`)
                .setURL('https://cosmofficial.herokuapp.com/')
                .setDescription(`Successfully issued **${amount} ${currencyName}**!`)
                .setFooter('Cosmofficial by POPINxxCAPS');

            return message.channel.send(embed);
        } catch (err) {
            console.log(err)
        }
    },
};