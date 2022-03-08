const lockedEmbed = require('../functions_discord/lockedEmbed');
const errorEmbed = require('../functions_discord/errorEmbed');
const gridModel = require('../models/gridSchema');
const remoteConfigModel = require('../models/remoteConfigSchema')
const chatModel = require('../models/chatSchema');
const economyModel = require('../models/economySettingSchema');
const allianceModel = require('../models/allianceSchema');
const playerModel = require('../models/playerSchema');
const verificationModel = require('../models/verificationSchema');

module.exports = {
    name: 'createalliance',
    aliases: ['ca'],
    description: "Create an alliance",
    permissions: ["SEND_MESSAGES"],
    async execute(req) {
        const message = req.message;
        const args = req.args;
        const discord = req.discord;
        if (args[0] === undefined) return errorEmbed(message.channel, '**Invalid Argument**\nPlease enter an alliance name!');
        let name = args[0];
        for (let i = 1; i < args.length; i++) {
            name = name + ' ' + `${args[i]}`;
        }

        const test = await allianceModel.findOne({
            allianceName: name
        })
        if (test !== null) return errorEmbed(message.channel, 'An alliance already exists with this name!')

        const verDoc = await verificationModel.findOne({
            userID: message.author.id
        })
        if (verDoc === null) return errorEmbed(message.channel, 'You must be verified to use this command!')

        const playerDoc = await playerModel.findOne({
            guildID: message.guild.id,
            displayName: verDoc.username
        })
        if (playerDoc === null) return errorEmbed(message.channel, 'Player document not found, have you joined the server?')
        if (playerDoc.factionTag === '') return errorEmbed(message.channel, 'You must be in a faction to use this command!')

        const alliances = await allianceModel.find({
            guildID: message.guild.id
        })

        let alliance;
        for (let i = 0; i < alliances.length; i++) {
            for (let a = 0; a < alliances[i].factionTags.length; a++) {
                if (alliances[i].factionTags[a].factionTag === playerDoc.factionTag) {
                    alliance = alliances[i]

                }
            }
        }
        if (alliance !== undefined) return errorEmbed(message.channel, 'Your faction is already in an alliance!');




        // Create the alliance

        await allianceModel.create({
            guildID: message.guild.id,
            allianceName: name,
            allianceLeaderID: message.author.id,
            allianceAdminIDs: [],
            factionTags: [{
                factionTag: playerDoc.factionTag
            }],
            invitedFactionTags: [],
            alliancePoints: '0'
        })
        const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle('Alliance Manager')
            .setURL('https://cosmofficial.herokuapp.com/')
            .setFooter('Cosmofficial by POPINxxCAPS')
            .setDescription(`Alliance **${name}** successfully created.`)
        try {
            message.channel.send(embed)
        } catch (err) {}
    }
}