const gridModel = require('../models/gridSchema');
const ms = require('ms')
module.exports = (client, discord) => {
    setInterval(async () => {
        const current_time = Date.now();
        const guildID = '799685703910686720';
        const guild = client.guilds.cache.get(guildID);
        const channelID = '916341723951685692';
        const channel = client.channels.cache.get(channelID);


        const grids = await gridModel.find({
            guildID: guildID,
            queuedForDeletion: true
        })

        const sortedGrids = grids.sort((a, b) => ((a.displayName) > (b.displayName)) ? 1 : -1)

        try {
            channel.bulkDelete(20);
        } catch(err) {

        }

        let embed = new discord.MessageEmbed()
        .setColor('#E02A6B')
        .setTitle('Trash Cleanup Queue')
        .setURL('https://cosmofficial.herokuapp.com/')
        .setFooter('Cosmofficial by POPINxxCAPS');

        let embedString = '';
        for(let i = 0; i < grids.length; i++) {
            const grid = grids[i];
            embedString += `${grid.displayName} ${ms(parseInt(grid.deletionTime) - current_time)} ${grid.deletionReason}\n`
            if(embedString.length > 900) {
                embed.addFields({
                    name: 'Grids Queued for Clean-Up',
                    value: embedString
                })
                try {
                    channel.send(embed)
                } catch(err) {}
                embedString = ''
                embed = new discord.MessageEmbed()
                .setColor('#E02A6B')
                .setTitle('Trash Cleanup Queue')
                .setURL('https://cosmofficial.herokuapp.com/')
                .setFooter('Cosmofficial by POPINxxCAPS');
            }
        }
        if(embedString === '') {
            embedString = 'No Grids Queued for Deletion'
        }
        embed.addFields({
            name: 'Grids Queued for Clean-Up',
            value: embedString
        })

        try {
            channel.send(embed)
        } catch(err) {}
        return;
    }, 30000)
}