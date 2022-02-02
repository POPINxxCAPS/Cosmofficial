const economySettings = require('../models/economySettingSchema');


let settingArray = [{
    name: 'CurrencyName',
    value: `Name Not Set`,
    description: 'Sets your currency name.',
    ecoRequired: true,
    adminRequired: false,
    mappingRequired: false,
    eventRequired: false
}, {
    name: 'StartingBalance',
    value: `50000`,
    description: 'Sets default starting balance.',
    ecoRequired: true,
    adminRequired: false,
    mappingRequired: false,
    eventRequired: false
}, {
    name: 'OnlinePlayerReward',
    value: `1`,
    description: 'Sets value to give online players (per second)',
    ecoRequired: true,
    adminRequired: false,
    mappingRequired: false,
    eventRequired: false
}, {
    name: 'TimelyReward',
    value: `5000`,
    description: 'Sets max timely reward.',
    ecoRequired: true,
    adminRequired: false,
    mappingRequired: false,
    eventRequired: false
}, {
    name: 'TimelyCooldown',
    value: `3600`,
    description: 'Sets max timely cooldown (In seconds).',
    ecoRequired: true,
    adminRequired: false,
    mappingRequired: false,
    eventRequired: false
}, {
    name: 'HotzoneReward',
    value: `500000`,
    description: 'Sets total/max amount of tokens to reward per zone.',
    ecoRequired: true,
    adminRequired: false,
    mappingRequired: false,
    eventRequired: true
}, {
    name: 'LotteryTicketPrice',
    value: `10000`,
    description: 'Sets ticket price for lottery. 0.1% win chance per ticket.',
    ecoRequired: true,
    adminRequired: false,
    mappingRequired: false,
    eventRequired: false
}, {
    name: 'LotteryChannel',
    value: `Not Set`,
    description: 'Sets the channel for the lottery system. Accepts a channel ID.',
    ecoRequired: true,
    adminRequired: false,
    mappingRequired: false,
    eventRequired: false
}]





module.exports = {
    name: 'checkeconomysettings',
    aliases: ['ces'],
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

        let changedBool = false;
        settingArray.forEach(setting => {
            if (validArgs.includes(setting.name.toLowerCase())) {} else {
                settings.settings.push(setting)
            }
        })
        settings.save()
        const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle('Economy Setup')
            .setURL('https://www.patreon.com/Cosmofficial')
            .setDescription('Format: c!ees {setting} {value}\n{} = Required Argument')
            .setFooter('Cosmofficial by POPINxxCAPS');

        settings.settings.forEach(setting => {
            let locked;
            if (setting.adminRequired === true && administrationPackage === false) {
                locked = true
            }
            if (setting.mappingRequired === true && mappingPackage === false) {
                locked = true
            }
            if (setting.eventRequired === true && pvpEventPackage === false) {
                locked = true
            }
            if (setting.ecoRequired === true && economyPackage === false) {
                locked = true
            }

            if (locked === true) {
                embed.addFields({
                    name: `${setting.name}`,
                    value: `Feature Locked`
                })
            } else {
                embed.addFields({
                    name: `${setting.name}`,
                    value: `${setting.value}\n${setting.description}`
                })
            }

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