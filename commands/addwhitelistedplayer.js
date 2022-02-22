const lockedEmbed = require('../functions_discord/lockedEmbed');
const errorEmbed = require('../functions_discord/errorEmbed');
const whitelistModel = require('../models/whitelistSchema');
const whitelistSettingsModel = require('../models/whitelistSettingSchema');
module.exports = {
    name: 'addwhitelistedplayer',
    aliases: ['awp'],
    description: "Add a player to the whitelist",
    permissions: ["ADMINISTRATOR"],
    async execute(message, args, cmd, client, discord, mainGuild, guild) {
        let whitelistSettings = await whitelistSettingsModel.findOne({
            guildID: guild.id
        })
        if(whitelistSettings === null) {
            whitelistSettings = await whitelistSettingsModel.create({
                guildID: guild.id,
                enabled: false
            })
        }

        if (args[0] === undefined) return errorEmbed(message.channel, 'Invalid format.\nValid: c!awp {username}');
        let searchTerm = args[0];
        for (let i = 1; i < args.length; i++) {
            searchTerm = searchTerm + ' ' + `${args[i]}`;
        }
        let whitelistDoc = await whitelistModel.findOne({
            guildID: guild.id,
            username: searchTerm
        })
        if (whitelistDoc !== null) return errorEmbed(message.channel, 'Username is already whitelisted.');

        await whitelistModel.create({
            guildID: guild.id,
            username: searchTerm
        })

        const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle(`Whitelist Manager`)
            .setURL('https://cosmofficial.herokuapp.com/')
            .setFooter('Cosmofficial by POPINxxCAPS')
            .setDescription(`Successfully added ${searchTerm} to the whitelist.`)
        return message.channel.send(embed);
    }
}