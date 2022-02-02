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
            .setURL('https://mod.io/members/popinuwu')
            .setFooter('Cosmofficial by POPINxxCAPS')
            .setDescription(`Whitelist Enabled: ${whitelistSettings.enabled}\nEdit command: c!wl {true/false}\nAdd Player: c!awp {username}\nRemove Player: c!rwp {username}`)
            .addFields({
                name: 'Whitelisted Players',
                value: whitelistString
            })
        return message.channel.send(embed);
    }
}