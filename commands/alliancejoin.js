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
    name: 'alliancejoin',
    aliases: ['aj'],
    description: "Join an existing alliance",
    permissions: ["SEND_MESSAGES"],
    async execute(message, args, cmd, client, discord, mainGuild, guild, playerEco) {
        if (args[0] === undefined) return errorEmbed(message.channel, discord, '**Invalid Argument**\nPlease enter an alliance name!');
        let name = args[0];
        for (let i = 1; i < args.length; i++) {
            name = name + ' ' + `${args[i]}`;
        }

        let targetAlliance = await allianceModel.findOne({
            allianceName: name
        })
        if (targetAlliance === null) return errorEmbed(message.channel, discord, 'Invalid alliance name!')

        const verDoc = await verificationModel.findOne({
            userID: message.author.id
        })
        if (verDoc === null) return errorEmbed(message.channel, discord, 'You must be verified to use this command!')

        const playerDoc = await playerModel.findOne({
            guildID: message.guild.id,
            displayName: verDoc.username
        })
        if (playerDoc === null) return errorEmbed(message.channel, discord, 'Player document not found, have you joined the server?')
        if (playerDoc.factionTag === '') return errorEmbed(message.channel, discord, 'You must be in a faction to use this command!')

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
        if (alliance !== undefined) return errorEmbed(message.channel, discord, 'Your faction is already in an alliance!');

        let updated = false
        for (let i = 0; i < targetAlliance.invitedFactionTags.length; i++) {
            if (targetAlliance.invitedFactionTags[i].factionTag === playerDoc.factionTag) {
                targetAlliance.invitedFactionTags[i].remove();
                targetAlliance.factionTags.push({
                    factionTag: playerDoc.factionTag
                })
                updated = true;
            }
        }



        let embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle('Alliance Manager')
            .setURL('https://mod.io/members/popinuwu')
            .setFooter('Cosmofficial by POPINxxCAPS')

        if (updated === true) {
            targetAlliance.save();
            embed.setDescription(`Successfully joined the **${targetAlliance.allianceName}** alliance.`)
        } else {
            embed.setDescription(`You are not invited to the **${targetAlliance.allianceName}** alliance.`)
        }
        try {
            message.channel.send(embed)
        } catch (err) {}
    }
}