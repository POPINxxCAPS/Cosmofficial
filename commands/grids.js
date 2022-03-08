const remoteConfigModel = require('../models/remoteConfigSchema');
const gridModel = require('../models/gridSchema');
const verificationModel = require('../models/verificationSchema');
const lockedEmbed = require('../functions_discord/lockedEmbed');
const errorEmbed = require('../functions_discord/errorEmbed');
const getGrids = require('../functions_db/getGrids')
const getGridsByPCU = require('../functions_db/getGridsByPCU')
const getGridsByBlockCount = require('../functions_db/getGridsByBlockCount')
const getGridsByMass = require('../functions_db/getGridsByMass')

async function fields(modifier, gridData) {
    let fields = [];
    if (modifier === 'blockcount') {
        for (let i = 0; i < 9; i++) {
            fields.push({
                name: `Grid Name: ${gridData[i].displayName}`,
                value: `Block Count: ${gridData[i].blocksCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Owner: ${gridData[i].ownerDisplayName}`
            })
        }
    }
    if (modifier === 'pcu') {
        for (let i = 0; i < 9; i++) {
            fields.push({
                name: `Grid Name: ${gridData[i].displayName}`,
                value: `PCU: ${gridData[i].PCU.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Owner: ${gridData[i].ownerDisplayName}`
            })
        }
    }
    if (modifier === 'mass') {
        for (let i = 0; i < 9; i++) {
            fields.push({
                name: `Grid Name: ${gridData[i].displayName}`,
                value: `Mass: ${gridData[i].mass.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Owner: ${gridData[i].ownerDisplayName}`
            })
        }
    }
    return fields;
}

async function embed(discord, channel, description, fields) {
    const embed = new discord.MessageEmbed()
        .setColor('#E02A6B')
        .setTitle('Grids Manager')
        .setURL('https://cosmofficial.herokuapp.com/')
        .setDescription(description)
        .setFooter('Cosmofficial by POPINxxCAPS');

    for (let i = 0; i < fields.length; i++) {
        embed.addFields(fields[i])
    }
    channel.send(embed)
    return;
}

module.exports = {
    name: 'grids',
    aliases: ['grids'],
    description: "Lookup top grids, optionally of a player",
    permissions: ["SEND_MESSAGES"],
    async execute(req) {
        const message = req.message;
        const args = req.args;
        const discord = req.discord;
        const guild = req.guild;
        // Confirm server has been configured before attempting the command.
        let configCheck = await remoteConfigModel.findOne({
            guildID: guild.id
        }) // Check if config already created, if true, return message to channel
        if (configCheck === null) return errorEmbed(message.channel, 'This discord does not have a server registered.\nUse c!setup to add your remote configuration.');

        let gridData;
        let description;

        if (args[0] === undefined) {
            description = "Top 10 Grids (Block Count)"
            gridData = await getGridsByBlockCount(guild.id)
            if (gridData.length < 10) return errorEmbed.message.channel, ('There are not enough grids to display the information!')
            embedFields = await fields('blockcount', gridData)
            return await embed(discord, message.channel, description, embedFields)
        }

        if (args[0] === 'pcu' || args[0] === 'PCU') {
            description = "Top 10 Grids (PCU)"
            gridData = await getGridsByPCU(guild.id)
            if (gridData.length < 10) return errorEmbed(message.channel, 'There are not enough grids to display the information!')
            embedFields = await fields('pcu', gridData)
            return await embed(discord, message.channel, description, embedFields)
        }

        if (args[0] === 'mass') {
            description = "Top 10 Ships (Mass)"
            gridData = await getGridsByMass(guild.id)

            if (gridData.length < 10) return errorEmbed(message.channel, 'There are not enough grids to display the information!')
            embedFields = await fields('mass', gridData)
            return await embed(discord, message.channel, description, embedFields)
        }

        // If args are not undefined, but do not match anything above, attempt to check for an @'ed player
        const target = message.mentions.users.first();
        if (!target) return message.channel.send('Invalid command format.');
        let targetVerification = await verificationModel.findOne({
            userID: target.id
        })
        if (targetVerification === null) return errorEmbed(message.channel, 'User is not verified. Cannot display information.')
        const targetGT = targetVerification.username;
        description = `${targetGT}'s Top 10 Grids (Block Count)`
        gridData = await getGridsByBlockCount(guild.id, targetGT)

        if (gridData.length < 10) return errorEmbed(message.channel, `${targetGT} doesn't own at least 10 grids! Cannot display.\nTry the website instead! (Click-able link above)`)
        embedFields = await fields('blockcount', gridData)
        return await embed(discord, message.channel, description, embedFields)
    }
}