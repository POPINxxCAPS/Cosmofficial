const chatModel = require('../models/chatSchema');
const lockedEmbed = require('../functions_discord/lockedEmbed');
const economySettings = require('../models/economySettingSchema');
const playerEcoModel = require('../models/playerEcoSchema');
const errorEmbed = require('../functions_discord/errorEmbed');
module.exports = {
    name: 'balance',
    aliases: ['bal'],
    description: "List server chat messages",
    permissions: ["SEND_MESSAGES"],
    async execute(message, args, cmd, client, discord, mainGuild, guild, playerEco) {
        let guildOwner = mainGuild.members.cache.get(message.guild.owner.user.id);
        let economyPackage;
        if (guildOwner.roles.cache.has('854236270129971200') || guildOwner.roles.cache.has('883535930630213653') || guildOwner.roles.cache.has('883534965650882570')) {
            economyPackage = true;
        }
        if(economyPackage !== true) return lockedEmbed(message.channel, discord);

        let ecoSettings = await economySettings.findOne({
            guildID: message.guild.id,
        })
        if(ecoSettings === null) {
            return errorEmbed(message.channel, 'An admin must first setup economy with c!ces')
        }
        let currencyName;
        ecoSettings.settings.forEach(setting => {
            if(setting.name === 'CurrencyName') {
                currencyName = setting.value;
            }
        })

        if(args.length) {
            const target = message.mentions.users.first();
            if(!target) return errorEmbed(message.channel, 'Invalid argument. Valid: @username')
            const targetData = await playerEcoModel.findOne({ userID: target.id });
            if (!targetData) return errorEmbed(message.channel, 'User not found in the database.')
            const balEmbed =  new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle(`Economy Manager`)
            .setURL('https://mod.io/members/popinuwu')
            .setDescription(`**Balance of User:** <@${target.id}>`)
            .addFields(
                {name: `${currencyName}`, value: `${targetData.currency}`},
                {name: 'Vault', value: `${targetData.vault}`},
                )
            .setFooter('Cosmofficial by POPINxxCAPS');
            message.delete().catch(err => {})
            return message.channel.send(balEmbed)
        }
        if(!parseInt(playerEco.currency)) {
            playerEco.currency = 0;
        }
        if(!parseInt(playerEco.vault)) {
            playerEco.vault = 0;
        }
        playerEco.currency = Math.round(playerEco.currency)
        playerEco.vault = Math.round(playerEco.vault)
        playerEco.save();
        const balEmbed =  new discord.MessageEmbed()
        .setColor('#E02A6B')
        .setTitle(`Economy Manager`)
        .setURL('https://mod.io/members/popinuwu')
        .setDescription(`**Balance of User:** <@${message.author.id}>`)
        .addFields(
            {name: `${currencyName}`, value: `${playerEco.currency}`},
            {name: 'Vault', value: `${playerEco.vault}`},
            )
        .setFooter('Cosmofficial by POPINxxCAPS');
   
        message.channel.send(balEmbed);
        
    }
}