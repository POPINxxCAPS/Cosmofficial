const serverLogSettingModel = require('../models/serverLogSettingSchema');
const lockedEmbed = require('../functions_discord/lockedEmbed');
const errorEmbed = require('../functions_discord/errorEmbed');


module.exports = {
    name: 'editserverlogsettings',
    aliases: ['esls'],
    description: "Edit this discord's settings file",
    permissions: ["ADMINISTRATOR"],
    async execute(message, args, cmd, client, discord, mainGuild, guild) {

        let guildOwner = mainGuild.members.cache.get(message.guild.owner.user.id);
        let patron = false;
        if (!guildOwner || guildOwner === null || guildOwner === undefined) return message.channel.send('The owner of this discord must be in the Cosmofficial discord to enable usage of this command.');
        if (guildOwner.roles.cache.has('883535682553929779') || guildOwner.roles.cache.has('883535930630213653') || guildOwner.roles.cache.has('883534965650882570')) {
            patron = true;
        }
        // if(patron === false) return lockedEmbed(message.channel, discord); // Disabled, is meant to be free

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

        if (settings.settings.length === 0) {
            embed.addFields({
                name: 'No Settings Generated',
                value: 'Use c!ces to check current settings and update your list of settings.'
            })
        }


        const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle('Server Log Setup')
            .setURL('https://www.patreon.com/Cosmofficial')
            .setFooter('Cosmofficial by POPINxxCAPS');


        let validArgString = '';
        validArgs.forEach(arg => {
            validArgString += `${arg}\n`
        })
        if(args[0] === undefined) return errorEmbed(message.channel, `Invalid Argument *one*\nValid: ${validArgs}`);
        if(args[0] === 'enabled') {
            if(Boolean(args[1])) {
                settings.settings.forEach(setting => {
                    if(setting.name === 'Enabled') {
                        setting.value = args[1];
                    }
                })
                settings.save(); 
                embed.setDescription(`Server log enabled set to **${args[1]}**`)
            } else {
                return errorEmbed(message.channel, `Invalid argument *two*\nValid: True or False`)
            }
        }
        return message.channel.send(embed);
    }
}