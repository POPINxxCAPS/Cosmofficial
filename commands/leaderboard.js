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
        const discord = req.discord;
        const guild = req.guild;
        const ecoSettings = req.ecoSettings;
        const currencyName = ecoSettings.currencyName;

        const lbArray = await playerEcoModel.find({
            guildID: guild.id
        });
        let shortenedLbArray = []
        for (const doc of lbArray) { // Making extra sure it adds balances correctly before sorting
            const currency = parseInt(doc.currency) || 0;
            const vault = parseInt(doc.vault) || 0;
            const balance = currency + vault;

            shortenedLbArray.push({
                userID: doc.userID,
                balance: balance,
            })
        }
        const lbArraySorted = shortenedLbArray.sort((a, b) => (a.balance > b.balance) ? -1 : 1);
        let embedString = '';
        let count = 0;
        let expectedCount = 9;
        for (let i = 0; count <= expectedCount || i >= lbArraySorted.length; i++) {
            if (lbArraySorted[i] === undefined) continue;
            let discUser = await client.users.cache.find(user => user.id === lbArraySorted[i].userID);
            if (discUser === undefined) {
                console.log(lbArraySorted[i]);
            } else { // If member is no longer in discord, skip.
                // If member is in the discord, add their balance and username to the string.'
                if (embedString === '') {
                    embedString = `${discUser.username}: ${lbArraySorted[i].balance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}\n`
                } else {
                    embedString = embedString + `${discUser.username}: ${lbArraySorted[i].balance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}\n`
                }
                count += 1; // Trying to figure out why it's skipping people.
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