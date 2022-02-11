const playerEcoModel = require('../models/playerEcoSchema');
const economySettingModel = require('../models/economySettingSchema');
const errorEmbed = require('../functions_discord/errorEmbed');
module.exports = {
    name: "taketokens",
    aliases: ['take'],
    permissions: ["ADMINISTRATOR"],
    description: "Gives Cosmic Tokens to the targetted player.",
    async execute(message, args, cmd, client, discord, mainGuild, guild, playerEco) {
        let guildOwner = mainGuild.members.cache.get(message.guild.owner.user.id);
        let economyPackage;
        if (guildOwner.roles.cache.has('854236270129971200') || guildOwner.roles.cache.has('883535930630213653') || guildOwner.roles.cache.has('883534965650882570')) {
            economyPackage = true;
        }
        if (economyPackage !== true) return lockedEmbed(message.channel, discord);

        let ecoSettings = await economySettingModel.findOne({
            guildID: message.guild.id,
        })
        if (ecoSettings === null) {
            return errorEmbed(message.channel, 'An admin must first setup economy with c!ces')
        }
        let currencyName;
        await ecoSettings.settings.forEach(setting => {
            if (setting.name === 'CurrencyName') {
                currencyName = setting.value;
            }
        })




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
            targetData.currency = parseFloat(targetData.currency) - parseFloat(args[1]);
            targetData.save();
            const embed = new discord.MessageEmbed()
                .setColor('#E02A6B')
                .setTitle(`Economy Manager`)
                .setURL('https://mod.io/members/popinuwu')
                .setDescription(`Successfully removed **${amount} ${currencyName}**!`)
                .setFooter('Cosmofficial by POPINxxCAPS');

            return message.channel.send(embed);
        } catch (err) {
            console.log(err)
        }
    },
};