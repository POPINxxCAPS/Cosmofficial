const lockedEmbed = require('../functions_discord/lockedEmbed');
const errorEmbed = require('../functions_discord/errorEmbed');
const whitelistModel = require('../models/whitelistSchema');
const whitelistSettingsModel = require('../models/whitelistSettingSchema');
module.exports = {
    name: 'whitelist',
    aliases: ['wl'],
    description: "Views the current whitelist",
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

        if(args[0] === 'true') {
            whitelistSettings.enabled = true;
            whitelistSettings.save();
        }
        if(args[0] === 'false') {
            whitelistSettings.enabled = false;
            whitelistSettings.save();
        }
        
        let whitelistDocs = await whitelistModel.find({
            guildID: guild.id,
        })
        let whitelistString = '';
        if(whitelistDocs.length !== 0) {
            whitelistDocs.forEach(doc => {
                whitelistString += `${doc.username}\n`
            })
        }
        
        if(whitelistString === '') {
            whitelistString = 'No usernames on the whitelist.'
        }
        const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle(`Whitelist Manager`)
            .setURL('https://cosmofficial.herokuapp.com/')
            .setFooter('Cosmofficial by POPINxxCAPS')
            .setDescription(`Whitelist Enabled: ${whitelistSettings.enabled}\nEdit command: c!wl {true/false}\nAdd Player: c!awp {username}\nRemove Player: c!rwp {username}`)
            .addFields({
                name: 'Whitelisted Players',
                value: whitelistString
            })
        return message.channel.send(embed);
    }
}