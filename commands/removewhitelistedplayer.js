const lockedEmbed = require('../functions_discord/lockedEmbed');
const errorEmbed = require('../functions_discord/errorEmbed');
const whitelistSettingsModel = require('../models/whitelistSchema');
module.exports = {
    name: 'removewhitelistedplayer',
    aliases: ['rwp'],
    description: "Removes a player from the whitelist",
    permissions: ["ADMINISTRATOR"],
    async execute(message, args, cmd, client, discord, mainGuild, guild) {
        let guildOwner = mainGuild.members.cache.get(message.guild.owner.user.id);
        if (!guildOwner || guildOwner === null || guildOwner === undefined) return message.channel.send('The owner of this discord must be in the Cosmofficial discord to enable usage of this command.');
        let administrationPackage;
        if (guildOwner.roles.cache.has('883535682553929779') || guildOwner.roles.cache.has('883535930630213653') || guildOwner.roles.cache.has('883534965650882570')) {
            administrationPackage = true;
        }
        if (administrationPackage === undefined) return lockedEmbed(message.channel, discord);

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
        let whitelistDoc = await whitelistSettingsModel.findOne({
            guildID: guild.id,
            username: searchTerm
        })
        if (whitelistDoc === null) return errorEmbed(message.channel, 'Username is not whitelisted.');

        whitelistDoc.remove();

        const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle(`Whitelist Manager`)
            .setURL('https://cosmofficial.herokuapp.com/')
            .setFooter('Cosmofficial by POPINxxCAPS')
            .setDescription(`Successfully removed ${searchTerm} from the whitelist.`)
        return message.channel.send(embed);
    }
}