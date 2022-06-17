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
        const lbArraySorted = await lbArray.sort((a, b) => ((parseFloat(a.currency) + parseFloat(a.vault)) > (parseFloat(b.currency) + parseFloat(b.vault))) ? -1 : 1);
        let embedString = '';
        let count = 0;
        let expectedCount = 9;
        for(let i = 0; count <= expectedCount || i >= lbArraySorted.length; i++) {
            if(lbArraySorted[i] === undefined) continue;
            let discUser = await client.users.cache.find(user => user.id === `${lbArraySorted[i].userID}`);
            if (discUser === undefined) {} else { // If member is no longer in discord, skip.
                count += 1;
                // If member is in the discord, add their balance and username to the string.'
                let balance = parseFloat(lbArraySorted[i].vault) + parseFloat(lbArraySorted[i].currency)
                if (embedString === '') {
                    embedString = `${discUser.username}: ${balance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}\n`
                } else {
                    embedString = embedString + `${discUser.username}: ${balance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}\n`
                }
            }
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