const economySettings = require('../models/economySettingSchema');


let settingArray = [{
    name: 'CurrencyName',
    value: `Name Not Set`,
    description: 'Sets your currency name.',
}, {
    name: 'StartingBalance',
    value: `50000`,
    description: 'Sets default starting balance.',
}, {
    name: 'OnlinePlayerReward',
    value: `1`,
    description: 'Sets value to give online players (per second)',
}, {
    name: 'TimelyReward',
    value: `5000`,
    description: 'Sets max timely reward.',
}, {
    name: 'TimelyCooldown',
    value: `3600`,
    description: 'Sets max timely cooldown (In seconds).',
}, {
    name: 'HotzoneReward',
    value: `500000`,
    description: 'Sets total/max amount of tokens to reward per zone.',
}, {
    name: 'LotteryTicketPrice',
    value: `10000`,
    description: 'Sets ticket price for lottery. 0.1% win chance per ticket.',

}, {
    name: 'LotteryChannel',
    value: `Not Set`,
    description: 'Sets the channel for the lottery system. Accepts a channel ID.',

}]



// Trash noob code

module.exports = {
    name: 'checkeconomysettings',
    aliases: ['ces'],
    description: "Edit this discord's settings file",
    permissions: ["ADMINISTRATOR"],
    async execute(req) {
        const message = req.message;
        const discord = req.discord;
        const mainGuild = req.mainGuild;
        const guild = req.guild;

        let guildOwner = mainGuild.members.cache.get(message.guild.owner.user.id);
        if (!guildOwner || guildOwner === null || guildOwner === undefined) return message.channel.send('The owner of this discord must be in the Cosmofficial discord to enable usage of this command.');

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
            .setURL('https://cosmofficial.herokuapp.com/')
            .setDescription('Format: c!ees {setting} {value}\n{} = Required Argument')
            .setFooter('Cosmofficial by POPINxxCAPS');

        settings.settings.forEach(setting => {
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