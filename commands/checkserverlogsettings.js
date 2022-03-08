const serverLogSettingModel = require('../models/serverLogSettingSchema');
const lockedEmbed = require('../functions_discord/lockedEmbed');
const errorEmbed = require('../functions_discord/errorEmbed');


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
    async execute(req) {
        const message = req.message;
        const discord = req.discord;
        const mainGuild = req.mainGuild;
        const guild = req.guild;
        let guildOwner = mainGuild.members.cache.get(message.guild.owner.user.id);
        if(guildOwner === undefined) return errorEmbed(message.channel, 'The owner of this discord must be in the Cosmofficial discord to use this.')

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
            .setURL('https://cosmofficial.herokuapp.com/')
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