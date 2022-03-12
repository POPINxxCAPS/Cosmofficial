const playerEcoModel = require('../models/playerEcoSchema');
const lockedEmbed = require('../functions_discord/lockedEmbed');
const cooldownEmbed = require('../functions_discord/cooldownEmbed');
const cooldownFunction = require('../functions_db/cooldownFunction');
const errorEmbed = require('../functions_discord/errorEmbed');
module.exports = {
    name: 'rob',
    aliases: ['rob'],
    description: "Grants small amount of currency",
    permissions: ["SEND_MESSAGES"],
    async execute(req) {
        const message = req.message;
        const discord = req.discord;
        const mainGuild = req.mainGuild;
        const guild = req.guild;
        const playerEco = req.playerEco;
        const ecoSettings = req.ecoSettings;
        const currencyName = ecoSettings.currencyName;
        let guildOwner = mainGuild.members.cache.get(message.guild.owner.user.id);
        let economyPackage;
        const cdInSec = 3600;
        if (guildOwner.roles.cache.has('854236270129971200') || guildOwner.roles.cache.has('883535930630213653') || guildOwner.roles.cache.has('883534965650882570')) {
            economyPackage = true;
        }
        if (economyPackage !== true) return lockedEmbed(message.channel, discord);

        const target = message.mentions.users.first();
        if (!target) return errorEmbed(message.channel, 'You must mention a player to rob.')
        let targetDoc = await playerEcoModel.findOne({
            userID: target.id,
            guildID: message.guild.id
        })
        if (targetDoc === null) return errorEmbed(message.channel, 'That user does not exist in the database.');

        // Check for bonuses (future alliance + quest + leveling stuff)
        let bonusRobPercent = 0;
        let cooldownModifier = 1;

        cdInSec = cdInSec * cooldownModifier;
        const cooldown = await cooldownFunction.cd('rob', cdInSec, message)
        if (cooldown !== undefined) return cooldownEmbed(message.channel, cooldown, 'Rob', message.author.id);
        // Set reward Amount
        let robPerc = 0.1 + bonusRobPercent;

        let robAmt = Math.round(parseInt(targetDoc.currency) * robPerc);
        targetDoc.currency = parseInt(targetDoc.currency) - robAmt

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