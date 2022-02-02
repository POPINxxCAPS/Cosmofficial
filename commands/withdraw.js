const playerEcoModel = require('../models/playerEcoSchema');
const lockedEmbed = require('../functions_discord/lockedEmbed');
const economyModel = require('../models/economySettingSchema');
module.exports = {
    name: 'withdraw',
    aliases: ['with'],
    description: "Pay a user",
    permissions: ["SEND_MESSAGES"],
    async execute(message, args, cmd, client, discord, mainGuild, guild, playerEco) {
        let guildOwner = mainGuild.members.cache.get(message.guild.owner.user.id);
        let economyPackage;
        if (guildOwner.roles.cache.has('854236270129971200') || guildOwner.roles.cache.has('883535930630213653') || guildOwner.roles.cache.has('883534965650882570')) {
            economyPackage = true;
        }
        if (economyPackage !== true) return lockedEmbed(message.channel, discord);

        let ecoSettings = await economyModel.findOne({
            guildID: message.guild.id,
        })
        if(ecoSettings === null) {
            return errorEmbed(message.channel, discord, 'An admin must first setup economy with c!ces')
        }
        let currencyName;
        ecoSettings.settings.forEach(setting => {
            if(setting.name === 'CurrencyName') {
                currencyName = setting.value;
            }
        })



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
            .setURL('https://mod.io/members/popinuwu')
            .setDescription(`<@${message.author.id}> withdrew **${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ${currencyName}** from their vault.`)
            .setFooter('Cosmofficial by POPINxxCAPS');

        return message.channel.send(embed);
    }
}