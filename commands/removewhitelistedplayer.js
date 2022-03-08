const lockedEmbed = require('../functions_discord/lockedEmbed');
const errorEmbed = require('../functions_discord/errorEmbed');
const whitelistSettingsModel = require('../models/whitelistSchema');
module.exports = {
    name: 'removewhitelistedplayer',
    aliases: ['rwp'],
    description: "Removes a player from the whitelist",
    permissions: ["ADMINISTRATOR"],
    async execute(req) {
        const message = req.message;
        const args = req.args;
        const discord = req.discord;
        const guild = req.guild;
        let whitelistSettings = await whitelistSettingsModel.findOne({
            guildID: guild.id
        })
        if (whitelistSettings === null) {
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