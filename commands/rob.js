let playerEcoModel = require('../models/playerEcoSchema');
const lockedEmbed = require('../functions/discord/lockedEmbed');
const cooldownEmbed = require('../functions/discord/cooldownEmbed');
const cooldownFunction = require('../functions/database/cooldownFunction');
const errorEmbed = require('../functions/discord/errorEmbed');
module.exports = {
    name: 'rob',
    aliases: ['rob'],
    description: "Rob a % of another player's un-vaulted currency.",
    permissions: ["SEND_MESSAGES"],
    category: "Economy",
    categoryAliases: ['economy', 'eco'],
    async execute(req) {
        const message = req.message;
        const discord = req.discord;
        let playerEco = req.playerEco;
        const ecoSettings = req.ecoSettings;
        const currencyName = ecoSettings.currencyName;
        let cdInSec = 3600;

        const target = message.mentions.users.first();
        if (!target) return errorEmbed(message.channel, 'You must mention a player to rob.')
        let targetDoc = await playerEcoModel.findOne({
            userID: target.id,
            guildID: message.guild.id
        })
        if (targetDoc === null) return errorEmbed(message.channel, 'That user does not exist in the database. Rob cancelled.');
        if (parseInt(targetDoc.currency) < 0) return errorEmbed(message.channel, 'User has a negative balance due to an admin c!take. Rob cancelled.');

        // Check for bonuses (future alliance + quest + leveling stuff)
        let bonusRobPercent = 0;
        let cooldownModifier = 1;

        cdInSec = cdInSec * cooldownModifier;
        const cooldown = await cooldownFunction.cd('rob', cdInSec, message)
        if (cooldown !== undefined) return cooldownEmbed(message.channel, cooldown, 'Rob', message.author.id);
        // Set reward Amount
        let robPerc = 0.1 + bonusRobPercent;

        let robAmt = Math.round(parseInt(targetDoc.currency) * robPerc);
        targetDoc.currency = parseInt(targetDoc.currency) - robAmt;

        targetDoc.save();
        playerEco.currency = parseInt(playerEco.currency) + robAmt;
        playerEco.save();

        const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle(`Robbing & Stealing`)
            .setURL('https://cosmofficial.herokuapp.com/')
            .setDescription(`<@${message.author.id}> robbed **${robAmt.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ${currencyName}** from <@${target.id}>!`)
            .setFooter('Cosmofficial by POPINxxCAPS');

        return message.channel.send(embed);
    }
}