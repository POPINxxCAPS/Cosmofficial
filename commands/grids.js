const remoteConfigModel = require('../models/remoteConfigSchema');
const gridModel = require('../models/gridSchema');
const verificationModel = require('../models/verificationSchema');
const lockedEmbed = require('../functions_discord/lockedEmbed');
module.exports = {
    name: 'grids',
    aliases: ['grids'],
    description: "Lookup top grids, optionally of a player",
    permissions: ["SEND_MESSAGES"],
    async execute(message, args, cmd, client, discord, mainGuild, guild) {
        // Check if command should be ran
        let configCheck = await remoteConfigModel.findOne({guildID: guild.id}) // Check if config already created, if true, return message to channel
        if(configCheck === null) return message.channel.send('This discord does not have a server registered.\nUse c!setup to add your remote configuration.');
        
        if(args[0] === undefined) { // If no arguments
            let grids = await gridModel.find({guildID: guild.id})
            if(grids.length <= 8) return message.channel.send('Not enough grids to display.\nMust be at least 10 grids.')
            const sortedByBlockCount = grids.sort((a, b) => ((a.blocksCount) > (b.blocksCount)) ? -1 : 1);
            const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle('Grids Manager')
            .setURL('https://www.patreon.com/Cosmofficial')
            .setDescription(`Top 10 highest block grids out of ${sortedByBlockCount.length}`)
            .addFields(
            { name: `Grid Name: ${sortedByBlockCount[0].displayName}`, value: `Block Count: ${sortedByBlockCount[0].blocksCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Owner: ${sortedByBlockCount[0].ownerDisplayName}` },
            { name: `Grid Name: ${sortedByBlockCount[1].displayName}`, value: `Block Count: ${sortedByBlockCount[1].blocksCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Owner: ${sortedByBlockCount[1].ownerDisplayName}` },
            { name: `Grid Name: ${sortedByBlockCount[2].displayName}`, value: `Block Count: ${sortedByBlockCount[2].blocksCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Owner: ${sortedByBlockCount[2].ownerDisplayName}` },
            { name: `Grid Name: ${sortedByBlockCount[3].displayName}`, value: `Block Count: ${sortedByBlockCount[3].blocksCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Owner: ${sortedByBlockCount[3].ownerDisplayName}` },
            { name: `Grid Name: ${sortedByBlockCount[4].displayName}`, value: `Block Count: ${sortedByBlockCount[4].blocksCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Owner: ${sortedByBlockCount[4].ownerDisplayName}` },
            { name: `Grid Name: ${sortedByBlockCount[5].displayName}`, value: `Block Count: ${sortedByBlockCount[5].blocksCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Owner: ${sortedByBlockCount[5].ownerDisplayName}` },
            { name: `Grid Name: ${sortedByBlockCount[6].displayName}`, value: `Block Count: ${sortedByBlockCount[6].blocksCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Owner: ${sortedByBlockCount[6].ownerDisplayName}` },
            { name: `Grid Name: ${sortedByBlockCount[7].displayName}`, value: `Block Count: ${sortedByBlockCount[7].blocksCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Owner: ${sortedByBlockCount[7].ownerDisplayName}` },
            )
            .setFooter('Cosmofficial by POPINxxCAPS');
            return message.channel.send(embed)
        }

        if((args[0] === 'pcu') || (args[0] === 'mass')) {

            if(args[0] === 'pcu') {
                const target = message.mentions.users.first();
                if(!target) { // If no user mentioned, send top 10 by pcu
                    let grids = await gridModel.find({guildID: guild.id});
                    const sortedByPCU = grids.sort((a, b) => ((a.PCU) > (b.PCU)) ? -1 : 1);
                    const embed = new discord.MessageEmbed()
                    .setColor('#E02A6B')
                    .setTitle('Grids Manager')
                    .setURL('https://www.patreon.com/Cosmofficial')
                    .setDescription('Showing top 10 highest PCU grids')
                    .addFields(
                    { name: `Grid Name: ${sortedByPCU[0].displayName}`, value: `PCU: ${sortedByPCU[0].PCU.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Owner: ${sortedByPCU[0].ownerDisplayName}` },
                    { name: `Grid Name: ${sortedByPCU[1].displayName}`, value: `PCU: ${sortedByPCU[1].PCU.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Owner: ${sortedByPCU[1].ownerDisplayName}` },
                    { name: `Grid Name: ${sortedByPCU[2].displayName}`, value: `PCU: ${sortedByPCU[2].PCU.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Owner: ${sortedByPCU[2].ownerDisplayName}` },
                    { name: `Grid Name: ${sortedByPCU[3].displayName}`, value: `PCU: ${sortedByPCU[3].PCU.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Owner: ${sortedByPCU[3].ownerDisplayName}` },
                    { name: `Grid Name: ${sortedByPCU[4].displayName}`, value: `PCU: ${sortedByPCU[4].PCU.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Owner: ${sortedByPCU[4].ownerDisplayName}` },
                    { name: `Grid Name: ${sortedByPCU[5].displayName}`, value: `PCU: ${sortedByPCU[5].PCU.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Owner: ${sortedByPCU[5].ownerDisplayName}` },
                    { name: `Grid Name: ${sortedByPCU[6].displayName}`, value: `PCU: ${sortedByPCU[6].PCU.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Owner: ${sortedByPCU[6].ownerDisplayName}` },
                    { name: `Grid Name: ${sortedByPCU[7].displayName}`, value: `PCU: ${sortedByPCU[7].PCU.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Owner: ${sortedByPCU[7].ownerDisplayName}` },
                    { name: `Grid Name: ${sortedByPCU[8].displayName}`, value: `PCU: ${sortedByPCU[8].PCU.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Owner: ${sortedByPCU[8].ownerDisplayName}` },
                    { name: `Grid Name: ${sortedByPCU[9].displayName}`, value: `PCU: ${sortedByPCU[9].PCU.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Owner: ${sortedByPCU[9].ownerDisplayName}` },
                    )
                    .setFooter('Cosmofficial by POPINxxCAPS');
                    return message.channel.send(embed)
                } else { // If there is a target
                    let targetVerification = await verificationModel.findOne({userID: target.id})
                    if(targetVerification === null) return message.channel.send('User is not verified. Cannot display information.')
                    const targetGT = targetVerification.username;
                    let playerGrids = await gridModel.find({ownerDisplayName: targetGT, guildID: guild.id}); // Get target players grids from db
                    if(!playerGrids[0]) {return message.channel.send('Target has no grids to display.')}
                    const sortedByPCU = playerGrids.sort((a, b) => ((a.PCU) > (b.PCU)) ? -1 : 1); // Sort grids by pcu
                    let gridsString = ''; // Declare empty embed string
                    for(y = 1; y < 10; y++) {
                      if(!sortedByPCU[y]) { // If doesn't exist, do nothing
                      } else {gridsString += `\nGrid Name: ${sortedByPCU[y].displayName} - PCU: ${sortedByPCU[y].PCU.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`} // Else, add to string list
                    }
                    const embed = new discord.MessageEmbed()
                    .setColor('#E02A6B')
                    .setTitle('Grids Manager')
                    .setURL('https://www.patreon.com/Cosmofficial')
                    .setDescription(`Showing ${targetGT}'s Grids`)
                    .addFields(
                    { name: `Grids sorted by PCU`, value: `Grid Name: ${sortedByPCU[0].displayName} PCU: ${sortedByPCU[0].PCU.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${gridsString}` },
                    )
                    .setFooter('Cosmofficial by POPINxxCAPS');
                    return message.channel.send(embed)
                }
            }


            if(args[0] === 'mass') {
                const target = message.mentions.users.first();
                if(!target) { // If no user mentioned, send top 10 by mass
                    let grids = await gridModel.find({guildID: guild.id});
                    const sortedByMass = grids.sort((a, b) => ((a.mass) > (b.mass)) ? -1 : 1);
                    const embed = new discord.MessageEmbed()
                    .setColor('#E02A6B')
                    .setTitle('Grids Manager')
                    .setURL('https://www.patreon.com/Cosmofficial')
                    .setDescription('Showing top 10 highest mass grids')
                    .addFields(
                    { name: `Grid Name: ${sortedByMass[0].displayName}`, value: `Mass: ${sortedByMass[0].mass.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Owner: ${sortedByMass[0].ownerDisplayName}` },
                    { name: `Grid Name: ${sortedByMass[1].displayName}`, value: `Mass: ${sortedByMass[1].mass.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Owner: ${sortedByMass[1].ownerDisplayName}` },
                    { name: `Grid Name: ${sortedByMass[2].displayName}`, value: `Mass: ${sortedByMass[2].mass.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Owner: ${sortedByMass[2].ownerDisplayName}` },
                    { name: `Grid Name: ${sortedByMass[3].displayName}`, value: `Mass: ${sortedByMass[3].mass.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Owner: ${sortedByMass[3].ownerDisplayName}` },
                    { name: `Grid Name: ${sortedByMass[4].displayName}`, value: `Mass: ${sortedByMass[4].mass.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Owner: ${sortedByMass[4].ownerDisplayName}` },
                    { name: `Grid Name: ${sortedByMass[5].displayName}`, value: `Mass: ${sortedByMass[5].mass.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Owner: ${sortedByMass[5].ownerDisplayName}` },
                    { name: `Grid Name: ${sortedByMass[6].displayName}`, value: `Mass: ${sortedByMass[6].mass.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Owner: ${sortedByMass[6].ownerDisplayName}` },
                    { name: `Grid Name: ${sortedByMass[7].displayName}`, value: `Mass: ${sortedByMass[7].mass.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Owner: ${sortedByMass[7].ownerDisplayName}` },
                    { name: `Grid Name: ${sortedByMass[8].displayName}`, value: `Mass: ${sortedByMass[8].mass.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Owner: ${sortedByMass[8].ownerDisplayName}` },
                    { name: `Grid Name: ${sortedByMass[9].displayName}`, value: `Mass: ${sortedByMass[9].mass.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Owner: ${sortedByMass[9].ownerDisplayName}` },
                    )
                    .setFooter('Cosmofficial by POPINxxCAPS');
                    return message.channel.send(embed)
                } else { // If there is a target
                    let targetVerification = await verificationModel.findOne({userID: target.id})
                    if(targetVerification === null) return message.channel.send('User is not verified. Cannot display information.')
                    const targetGT = targetVerification.username;
                    let playerGrids = await gridModel.find({ownerDisplayName: targetGT, guildID: guild.id}); // Get target players grids from db
                    if(!playerGrids[0]) {return message.channel.send('Target has no grids to display.')}
                    const sortedByMass = playerGrids.sort((a, b) => ((a.mass) > (b.mass)) ? -1 : 1); // Sort grids by pcu
                    let gridsString = ''; // Declare empty embed string
                    for(y = 1; y < 10; y++) {
                      if(!sortedByMass[y]) { // If doesn't exist, do nothing
                      } else {gridsString += `\nGrid Name: ${sortedByMass[y].displayName} - Mass: ${sortedByMass[y].mass.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`} // Else, add to string list
                    }
                    const embed = new discord.MessageEmbed()
                    .setColor('#E02A6B')
                    .setTitle('Grids Manager')
                    .setURL('https://www.patreon.com/Cosmofficial')
                    .setDescription(`Showing ${targetGT}'s Grids`)
                    .addFields(
                    { name: `Grids sorted by Mass`, value: `Grid Name: ${sortedByMass[0].displayName} Mass: ${sortedByMass[0].mass.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${gridsString}` },
                    )
                    .setFooter('Cosmofficial by POPINxxCAPS');
                    return message.channel.send(embed)
                }
            }
        } else {
            const target = message.mentions.users.first();
            if(!target) return message.channel.send('Invalid command format.');
            let targetVerification = await verificationModel.findOne({userID: target.id})
            if(targetVerification === null) return message.channel.send('User is not verified. Cannot display information.')
            const targetGT = targetVerification.username;
            let playerGrids = await gridModel.find({ownerDisplayName: targetGT, guildID: guild.id}); // Get target players grids from db
            if(!playerGrids[0]) {return message.channel.send('Target has no grids to display.')}
            const sortedByBlockCount = playerGrids.sort((a, b) => ((a.blocksCount) > (b.blocksCount)) ? -1 : 1); // Sort grids by pcu
            let gridsString = ''; // Declare empty embed string
            for(y = 1; y < 10; y++) {
              if(!sortedByBlockCount[y]) { // If doesn't exist, do nothing
              } else {gridsString += `\nGrid Name: ${sortedByBlockCount[y].displayName} Block Count: ${sortedByBlockCount[y].blocksCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`} // Else, add to string list
            }
            const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle('Grids Manager')
            .setURL('https://www.patreon.com/Cosmofficial')
            .setDescription(`Showing ${targetGT}'s Grids`)
            .addFields(
            { name: `Grids sorted by Block Count`, value: `Grid Name: ${sortedByBlockCount[0].displayName} Block Count: ${sortedByBlockCount[0].blocksCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${gridsString}` },
            )
            .setFooter('Cosmofficial by POPINxxCAPS');
            return message.channel.send(embed)
        }
    }
}