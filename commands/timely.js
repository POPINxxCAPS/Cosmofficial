const playerEcoModel = require('../models/playerEcoSchema');
const lockedEmbed = require('../functions_discord/lockedEmbed');
const cooldownEmbed = require('../functions_discord/cooldownEmbed');
const cooldownFunction = require('../functions_db/cooldownFunction');
const economyModel = require('../models/economySettingSchema');
module.exports = {
    name: 'timely',
    aliases: ['time'],
    description: "Grants small amount of currency",
    permissions: ["SEND_MESSAGES"],
    async execute(req) {
        const message = req.message;
        const discord = req.discord;
        const mainGuild = req.mainGuild;
        const guild = req.guild;
        const playerEco = req.playerEco;
        let guildOwner = mainGuild.members.cache.get(message.guild.owner.user.id);
        let economyPackage;
        if (guildOwner.roles.cache.has('854236270129971200') || guildOwner.roles.cache.has('883535930630213653') || guildOwner.roles.cache.has('883534965650882570')) {
            economyPackage = true;
        }
        if (economyPackage !== true) return lockedEmbed(message.channel, discord);

        let ecoSettings = await economyModel.findOne({
            guildID: message.guild.id,
        })
        if (ecoSettings === null) {
            return errorEmbed(message.channel, 'An admin must first setup economy with c!ces')
        }
        let currencyName;
        let maxTimelyReward;
        let cdInSec;
        await ecoSettings.settings.forEach(setting => {
            if (setting.name === 'CurrencyName') {
                currencyName = setting.value;
            }
            if (setting.name === 'TimelyReward') {
                maxTimelyReward = parseInt(setting.value);
                if(maxTimelyReward === NaN) {
                    maxTimelyReward = 0;
                }
            }
            if (setting.name === 'TimelyCooldown') {
                cdInSec = setting.value
            }
        })


        // Check for premium
        let rewardModifier = 1;
        let cooldownModifier = 1;
        const memberTarget = guild.members.cache.find(member => member.id === message.author.id);
        let memberTargetMainGuild = mainGuild.members.cache.find(member => member.id === message.author.id);
        if (memberTarget === null || memberTarget === undefined) {} else {
            if (memberTarget.roles.cache.has('853949230350991392')) {
                rewardModifier += .35
                cooldownModifier -= .1
            }
            if (memberTarget.roles.cache.has('853947102521851914')) {
                rewardModifier += .7
                cooldownModifier -= .2
            }
            if (memberTarget.roles.cache.has('847648987933835285')) {
                rewardModifier += 1.15
                cooldownModifier -= .3
            }
        }
        if (memberTargetMainGuild === null || memberTargetMainGuild === undefined) {} else {
            if (memberTargetMainGuild.roles.cache.has('883564759541243925')) {
                rewardModifier += .35
                cooldownModifier -= .1
            }
            if (memberTargetMainGuild.roles.cache.has('883563886815617025')) {
                rewardModifier += .7
                cooldownModifier -= .2
            }
            if (memberTargetMainGuild.roles.cache.has('883564396587147275')) {
                rewardModifier += 1.15
                cooldownModifier -= .3
            }
        }
        
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