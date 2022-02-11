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
    name: 'allianceinvite',
    aliases: ['ai'],
    description: "Invite faction tag to alliance",
    permissions: ["SEND_MESSAGES"],
    async execute(message, args, cmd, client, discord, mainGuild, guild, playerEco) {
        if (args[0] === undefined) return errorEmbed(message.channel, '**Invalid Argument**\nPlease enter an faction tag!');
        if (args[0].length >= 5) return errorEmbed(message.channel, '**Invalid Argument**\nFaction tag is too long.')



        let factionTag = args[0] // May want to @ a player instead



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

        const playerFactionDocs = await playerModel.findOne({
            guildID: message.guild.id,
            factionTag: args[0]
        })
        if(playerFactionDocs.length === 0) return errorEmbed(message.channel, 'There is nobody in this faction!')

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
        if (alliance === undefined) return errorEmbed(message.channel, 'Your faction not in an alliance!');

        let allowed = false;
        if (alliance.allianceLeaderID === message.author.id || alliance.allianceAdminIDs.includes(message.author.id)) {
            allowed = true
        }
        if (allowed === false) return errorEmbed(message.channel, 'You are not permitted to do this. You must be the alliance leader, or admin of the alliance to use this command.')

        allowed = true;
        for(let i = 0; i < alliance.factionTags.length; i++) {
            if(alliance.factionTags[i].factionTag === args[0]) {
                allowed = false
            }
        }
        if(allowed === false) return errorEmbed(message.channel, 'This faction is already in your alliance.')

        allowed = true;
        for(let i = 0; i < alliance.invitedFactionTags.length; i++) {
            if(alliance.invitedFactionTags[i].factionTag === args[0]) {
                allowed = false
            }
        }
        if(allowed === false) return errorEmbed(message.channel, 'This faction is already invited to your alliance.')

        alliance.invitedFactionTags.push({
            factionTag: args[0]
        })
        alliance.save()


        const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle('Alliance Manager')
            .setURL('https://mod.io/members/popinuwu')
            .setFooter('Cosmofficial by POPINxxCAPS')
            .setDescription(`Faction **${factionTag}** successfully invited.`)
        try {
            message.channel.send(embed)
        } catch (err) {}
    }
}