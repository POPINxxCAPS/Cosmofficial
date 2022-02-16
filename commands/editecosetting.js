const economySettings = require('../models/economySettingSchema');

module.exports = {
    name: 'editeconomysettings',
    aliases: ['ees'],
    description: "Edit this discord's settings file",
    permissions: ["ADMINISTRATOR"],
    async execute(message, args, cmd, client, discord, mainGuild, guild) {

        let guildOwner = mainGuild.members.cache.get(message.guild.owner.user.id);
        if (!guildOwner || guildOwner === null || guildOwner === undefined) return message.channel.send('The owner of this discord must be in the Cosmofficial discord to enable usage of this command.');
        let pvpEventPackage;
        let administrationPackage;
        let mappingPackage;
        let economyPackage;
        if (guildOwner.roles.cache.has('883535682553929779') || guildOwner.roles.cache.has('883535930630213653') || guildOwner.roles.cache.has('883534965650882570')) {
            administrationPackage = true;
        }
        if (guildOwner.roles.cache.has('854211115915149342') || guildOwner.roles.cache.has('883535930630213653') || guildOwner.roles.cache.has('883534965650882570')) {
            pvpEventPackage = true;
        }
        if (guildOwner.roles.cache.has('883535470250831912') || guildOwner.roles.cache.has('883535930630213653') || guildOwner.roles.cache.has('883534965650882570')) {
            mappingPackage = true;
        }
        if (guildOwner.roles.cache.has('854236270129971200') || guildOwner.roles.cache.has('883535930630213653') || guildOwner.roles.cache.has('883534965650882570')) {
            economyPackage = true;
        }


        let settings = await economySettings.findOne({
            guildID: guild.id
        })
        if (settings === null) {
            await economySettings.create({
                guildID: guild.id,
                settings: []
            })
            settings = await economySettings.findOne({
                guildID: guild.id
            })
        }

        let validArgs = [];
        settings.settings.forEach(setting => {
            validArgs.push(setting.name.toLowerCase())
        })

        if (validArgs.includes(args[0]) && args[1] !== undefined) {} else {
            const embed = new discord.MessageEmbed()
                .setColor('#E02A6B')
                .setTitle('Invalid Arguments')
                .setURL('https://cosmofficial.herokuapp.com/')
                .setDescription('Format: c!ees {setting} {value}\n{} = Required Argument')
                .setFooter('Cosmofficial by POPINxxCAPS');


            settings.settings.forEach(setting => {
                if (setting.adminRequired === true && administrationPackage === false) return;
                if (setting.mappingRequired === true && mappingPackage === false) return;
                if (setting.eventRequired === true && pvpEventPackage === false) return;
                if (setting.ecoRequired === true && economyPackage === false) return;

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

        let settingValue = args[1];
        if (!args[2]) {} else {
            settingValue += ' ' + args[2]
        }



        settings.settings.forEach(setting => {
            if (setting.name.toLowerCase() === args[0].toLowerCase()) {
                setting.value = settingValue;
                const embed = new discord.MessageEmbed()
                    .setColor('#E02A6B')
                    .setTitle('Economy Setup')
                    .setURL('https://cosmofficial.herokuapp.com/')
                    .setDescription(`${setting.name} changed to ${settingValue}.`)
                    .setFooter('Cosmofficial by POPINxxCAPS');
                message.channel.send(embed)
            }
        })
        settings.save();
    }
}