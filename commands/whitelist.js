const lockedEmbed = require('../functions_discord/lockedEmbed');
const errorEmbed = require('../functions_discord/errorEmbed');
const whitelistModel = require('../models/whitelistSchema');
const whitelistSettingsModel = require('../models/whitelistSettingSchema');
module.exports = {
    name: 'whitelist',
    aliases: ['wl'],
    description: "View and manage the current whitelist.",
    permissions: ["ADMINISTRATOR"],
    category: "Admininstration",
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

        if (args[0] === 'true') {
            whitelistSettings.enabled = true;
            whitelistSettings.save();
        }
        if (args[0] === 'false') {
            whitelistSettings.enabled = false;
            whitelistSettings.save();
        }
        if (args[0] === 'add') {
            if (args[1] === undefined) return errorEmbed(message.channel, 'Invalid format.\nValid: c!wl add {username}');
            let searchTerm = args[1];
            for (let i = 2; i < args.length; i++) {
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
        }
        if (args[0] === 'remove') {
            if (args[1] === undefined) return errorEmbed(message.channel, 'Invalid format.\nValid: c!wl remove {username}');
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
        }

        let whitelistDocs = await whitelistModel.find({
            guildID: guild.id,
        })
        let whitelistString = '';
        if (whitelistDocs.length !== 0) {
            whitelistDocs.forEach(doc => {
                whitelistString += `${doc.username}\n`
            })
        }

        if (whitelistString === '') {
            whitelistString = 'No usernames on the whitelist.'
        }
        const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle(`Whitelist Manager`)
            .setURL('https://cosmofficial.herokuapp.com/')
            .setFooter('Cosmofficial by POPINxxCAPS')
            .setDescription(`Whitelist Enabled: ${whitelistSettings.enabled}\nEdit command: c!wl {true/false}\nAdd Player: c!wl add {username}\nRemove Player: c!wl remove {username}`)
            .addFields({
                name: 'Whitelisted Players',
                value: whitelistString
            })
        return message.channel.send(embed);
    }
}