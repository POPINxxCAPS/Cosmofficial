const playerEcoModel = require('../models/playerEcoSchema');
const lockedEmbed = require('../functions_discord/lockedEmbed');
const economyModel = require('../models/economySettingSchema');
module.exports = {
    name: 'pay',
    aliases: ['pay'],
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
                .setURL('https://mod.io/members/popinuwu')
                .setDescription(`<@${message.author.id}> successfully paid ${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ${currencyName} to <@${target.id}>`)
                .setFooter('Cosmofficial by POPINxxCAPS');

            return message.channel.send(embed);
        } catch (err) {
            console.log(err)
        }








    }
}