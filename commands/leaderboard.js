const playerEcoModel = require("../models/playerEcoSchema");
const economySettingModel = require('../models/economySettingSchema');
module.exports = {
    name: "leaderboard",
    aliases: ["lb"],
    permissions: ["SEND_MESSAGES"],
    description: "View top 10 balances",
    async execute(message, args, cmd, client, discord, mainGuild, guild) {
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


        const lbArray = await playerEcoModel.find({
            guildID: guild.id
        });
        const lbArraySorted = lbArray.sort((a, b) => ((parseFloat(a.currency) + parseFloat(a.vault)) > (parseFloat(b.currency) + parseFloat(b.vault))) ? -1 : 1);
        let embedString = '';
        let i = 0;
        while (i < 10) {
            if (client.users.cache.find(user => user.id === `${lbArraySorted[i].userID}`) === undefined) {} else { // If member is no longer in discord, skip.
                // If member is in the discord, add their balance and username to the string.'
                if (embedString === '') {
                    embedString = `${client.users.cache.find(user => user.id === `${lbArraySorted[i].userID}`).username}: ${(parseFloat(lbArraySorted[i].vault)+parseFloat(lbArraySorted[i].currency)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}\n`
                } else {
                    embedString = embedString + `${client.users.cache.find(user => user.id === `${lbArraySorted[i].userID}`).username}: ${(parseFloat(lbArraySorted[i].vault)+parseFloat(lbArraySorted[i].currency)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}\n`
                }
            }
            i += 1;
        }
        console.log(embedString)
        const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle('Economy Manager')
            .setURL('https://cosmofficial.herokuapp.com/')
            .addFields({
                name: `Top 10 Balances`,
                value: `${embedString}`
            }, )
            .setFooter('Cosmobot by POPINxxCAPS');

        message.channel.send(embed)
    }
}