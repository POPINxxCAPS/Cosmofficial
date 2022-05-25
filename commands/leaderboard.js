let playerEcoModel = require("../models/playerEcoSchema");
module.exports = {
    name: "leaderboard",
    aliases: ["lb"],
    permissions: ["SEND_MESSAGES"],
    description: "View top 10 bot economy balances.",
    category: "Economy",
    categoryAliases: ['economy', 'eco'],
    async execute(req) {
        const message = req.message;
        const client = req.client;
        const mainGuild = req.mainGuild;
        const discord = req.discord;
        const guild = req.guild;
        const ecoSettings = req.ecoSettings;
        const currencyName = ecoSettings.currencyName;

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
                name: `Top 10 ${currencyName} Balances`,
                value: `${embedString}`
            }, )
            .setFooter('Cosmobot by POPINxxCAPS');

        message.channel.send(embed)
    }
}