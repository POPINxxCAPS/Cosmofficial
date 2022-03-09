const playerEcoModel = require('../models/playerEcoSchema');
const lockedEmbed = require('../functions_discord/lockedEmbed');
const economyModel = require('../models/economySettingSchema');
const {
    VirtualType
} = require('mongoose');
module.exports = {
    name: 'deposit',
    aliases: ['dep'],
    description: "Pay a user",
    permissions: ["SEND_MESSAGES"],
    async execute(req) {
        const message = req.message;
        const args = req.args;
        const discord = req.discord;
        const mainGuild = req.mainGuild;
        const playerEco = req.playerEco;
        let guildOwner = mainGuild.members.cache.get(message.guild.owner.user.id);
        if(!guildOwner) return message.channel.send('The owner of this discord must be in the Cosmofficial discord to enable usage of this command.');

        let economyPackage;
        if (guildOwner.roles.cache.has('854236270129971200') || guildOwner.roles.cache.has('883535930630213653') || guildOwner.roles.cache.has('883534965650882570')) {
            economyPackage = true;
        }
        if (economyPackage !== true) return lockedEmbed(message.channel, discord);

        let ecoSettings = await economyModel.findOne({
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







        let amount;
        if (args[0] === 'all') {
            amount = parseInt(playerEco.currency)
        } else {
            amount = parseInt(args[0]);
        }
        if (amount % 1 != 0 || amount <= 0) return message.reply("Deposit amount must be a whole number");
        if (amount > playerEco.currency) return message.reply(`Insuffient ${currencyName}. Transaction failed.`);
        playerEco.currency = parseInt(playerEco.currency) - amount;
        playerEco.vault = parseInt(playerEco.vault) + amount;
        playerEco.save();



        const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle(`Economy Manager`)
            .setURL('https://cosmofficial.herokuapp.com/')
            .setDescription(`<@${message.author.id}> deposited **${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ${currencyName}** into their vault.`)
            .setFooter('Cosmofficial by POPINxxCAPS');

        return message.channel.send(embed);
    }
}