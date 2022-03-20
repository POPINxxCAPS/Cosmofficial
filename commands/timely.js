const cooldownEmbed = require('../functions/discord/cooldownEmbed');
const cooldownFunction = require('../functions/database/cooldownFunction');
module.exports = {
    name: 'timely',
    aliases: ['time'],
    description: "Grants small amount of currency.",
    permissions: ["SEND_MESSAGES"],
    category: "Economy",
    async execute(req) {
        const message = req.message;
        const discord = req.discord;
        let playerEco = req.playerEco;
        const ecoSettings = req.ecoSettings;
        const currencyName = ecoSettings.currencyName;
        const cdInSec = 60
        let maxTimelyReward = ecoSettings.timelyReward;
        if(maxTimelyReward === "Not Set") maxTimelyReward = 5000; 

        // Check for bonuses (for future feature use)
        let rewardModifier = 1;
        let cooldownModifier = 1;

        // Set reward Amount
        const randomNumber = Math.floor(Math.random() * Math.round(maxTimelyReward / 2)) + Math.round(maxTimelyReward / 2);
        let rewardAmount = Math.round((randomNumber * rewardModifier));
        let cooldownAmount = cdInSec * cooldownModifier;

        const cooldown = await cooldownFunction.cd('timely', cooldownAmount, message);
        if (cooldown !== undefined) {
            return cooldownEmbed(message.channel, cooldown, 'Timely', message.author.id)
        }
        playerEco.currency = parseInt(playerEco.currency) + rewardAmount;
        playerEco.save();

        const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle(`Economy Manager`)
            .setURL('https://cosmofficial.herokuapp.com/')
            .setDescription(`<@${message.author.id}> received **${rewardAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ${currencyName}**!`)
            .setFooter('Cosmofficial by POPINxxCAPS');

        return message.channel.send(embed);
    }
}