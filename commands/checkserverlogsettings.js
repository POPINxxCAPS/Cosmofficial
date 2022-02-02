const serverLogSettingModel = require('../models/serverLogSettingSchema');
const lockedEmbed = require('../functions_discord/lockedEmbed');


let settingArray = [{
    name: 'Enabled',
    value: `false`,
    description: 'Enables/Disables the Server Log',
}]





module.exports = {
    name: 'checkserverlogsettings',
    aliases: ['csls'],
    description: "Edit this discord's settings file",
    permissions: ["ADMINISTRATOR"],
    async execute(message, args, cmd, client, discord, mainGuild, guild) {

        let guildOwner = mainGuild.members.cache.get(message.guild.owner.user.id);
        let patron = false;
        if (!guildOwner || guildOwner === null || guildOwner === undefined) return message.channel.send('The owner of this discord must be in the Cosmofficial discord to enable usage of this command.');
        if (guildOwner.roles.cache.has('883535682553929779') || guildOwner.roles.cache.has('883535930630213653') || guildOwner.roles.cache.has('883534965650882570')) {
            patron = true;
        }
        if(patron === false) return lockedEmbed(message.channel, discord);

        let settings = await serverLogSettingModel.findOne({
            guildID: guild.id
        })
        if (settings === null) {
            await serverLogSettingModel.create({
                guildID: guild.id,
                settings: []
            })
            settings = await serverLogSettingModel.findOne({
                guildID: guild.id
            })
        }

        let validArgs = [];
        settings.settings.forEach(setting => {
            validArgs.push(setting.name.toLowerCase())
        })

        settingArray.forEach(setting => {
            if (validArgs.includes(setting.name.toLowerCase())) {} else {
                settings.settings.push(setting)
            }
        })
        settings.save()


        const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle('Server Log Setup')
            .setURL('https://www.patreon.com/Cosmofficial')
            .setDescription('Format: c!esls {setting} {value}\n{} = Required Argument')
            .setFooter('Cosmofficial by POPINxxCAPS');

        settings.settings.forEach(setting => {
            embed.addFields({
                name: `${setting.name}`,
                value: `${setting.value}\n${setting.description}`
            })
        })

        if (settings.settings.length === 0) {
            embed.addFields({
                name: 'No Settings Generated',
                value: 'Use c!ces to check current settings and update your list of settings.'
            })
        }
        return message.channel.send(embed)
    }
}