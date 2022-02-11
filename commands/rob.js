const playerEcoModel = require('../models/playerEcoSchema');
const lockedEmbed = require('../functions_discord/lockedEmbed');
const cooldownEmbed = require('../functions_discord/cooldownEmbed');
const cooldownFunction = require('../functions_db/cooldownFunction');
const economyModel = require('../models/economySettingSchema');
const errorEmbed = require('../functions_discord/errorEmbed');
module.exports = {
    name: 'rob',
    aliases: ['rob'],
    description: "Grants small amount of currency",
    permissions: ["SEND_MESSAGES"],
    async execute(message, args, cmd, client, discord, mainGuild, guild, playerEco) {
        let guildOwner = mainGuild.members.cache.get(message.guild.owner.user.id);
        let economyPackage;
        if (guildOwner.roles.cache.has('854236270129971200') || guildOwner.roles.cache.has('883535930630213653') || guildOwner.roles.cache.has('883534965650882570')) {
            economyPackage = true;
        }
        if (economyPackage !== true) return lockedEmbed(message.channel, discord);


        const target = message.mentions.users.first();
        if(!target) return errorEmbed(message.channel, 'You must mention a player to rob.')
        let targetDoc = await playerEcoModel.findOne({
            userID: target.id,
            guildID: message.guild.id
        })
        if(targetDoc === null) return errorEmbed(message.channel, 'That user does not exist in the database.')

        let ecoSettings = await economyModel.findOne({
            guildID: message.guild.id,
        })
        if (ecoSettings === null) {
            return errorEmbed(message.channel, 'An admin must first setup economy with c!ces')
        }
        let currencyName;
        let cdInSec = 3600;
        await ecoSettings.settings.forEach(setting => {
            if (setting.name === 'CurrencyName') {
                currencyName = setting.value;
            }
        })

        
        
        // Check for premium
        let bonusRobPercent = 0;
        let cooldownModifier = 1;
        const memberTarget = guild.members.cache.find(member => member.id === message.author.id);
        let memberTargetMainGuild = mainGuild.members.cache.find(member => member.id === message.author.id);
        if(memberTargetMainGuild !== undefined) {
            if (memberTargetMainGuild.roles.cache.has('883564759541243925')) {
                bonusRobPercent += 0.05
                cooldownModifier -= 0.1
            }
            if (memberTargetMainGuild.roles.cache.has('883563886815617025')) {
                bonusRobPercent += 0.1
                cooldownModifier -= 0.2
            }
            if (memberTargetMainGuild.roles.cache.has('883564396587147275')) {
                bonusRobPercent += 0.15
                cooldownModifier -= 0.3
    
            }
            if (memberTargetMainGuild.roles.cache.has('889505618203918366')) {
                bonusRobPercent += 0.3
                cooldownModifier -= 0.4
            }
            if (memberTargetMainGuild.roles.cache.has('889505714815504405')) {
                bonusRobPercent += 0.6
                cooldownModifier -= 0.5
            }
        }
        
        
        cdInSec = cdInSec * cooldownModifier;
        const cooldown = await cooldownFunction.cd('rob', cdInSec, message)
        if(cooldown !== undefined) return cooldownEmbed(message.channel, cooldown, 'Rob', message.author.id);
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
            .setURL('https://mod.io/members/popinuwu')
            .setDescription(`<@${message.author.id}> robbed **${robAmt.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ${currencyName}** from <@${target.id}>!`)
            .setFooter('Cosmofficial by POPINxxCAPS');

        return message.channel.send(embed);
    }
}