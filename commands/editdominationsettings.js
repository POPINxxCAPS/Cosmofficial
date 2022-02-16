const dominationSettingModel = require('../models/dominationSettingSchema');
const lockedEmbed = require('../functions_discord/lockedEmbed');
const errorEmbed = require('../functions_discord/errorEmbed');

module.exports = {
    name: 'editdominationsettings',
    aliases: ['eds'],
    description: "Edit the domination general settings",
    permissions: ["ADMINISTRATOR"],
    async execute(message, args, cmd, client, discord, mainGuild, guild) {
        const current_time = Date.now();
        const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle(`Domination Configuration`)
            .setURL('https://cosmofficial.herokuapp.com/')
            .setFooter('Cosmofficial by POPINxxCAPS')

        let guildOwner = mainGuild.members.cache.get(message.guild.owner.user.id);
        if (!guildOwner || guildOwner === null || guildOwner === undefined) return message.channel.send('The owner of this discord must be in the Cosmofficial discord to enable usage of this command.');
        let patron = false;
        if (guildOwner.roles.cache.has('883535930630213653') || guildOwner.roles.cache.has('883564396587147275')) {
            patron = true;
        }
        if (patron === false) return lockedEmbed(message.channel, discord);


        let settings = await dominationSettingModel.findOne({
            guildID: guild.id
        })
        if (settings === null) {
            await dominationSettingModel.create({
                guildID: message.guild.id,
                dominationEnabled: false,
                newGameDelay: '86400000',
                gameEndTime: current_time,
                rewardPerPoint: '10',
                winReward: '2500000',
                matchTime: '604800000',
                pointLimit: '100000',
                captureTime: '900000',
                objectives: []
            })
            settings = await dominationSettingModel.findOne({
                guildID: guild.id
            })
        }


        let validArgs = ['enabled', 'newgamedelay', 'rewardperpoint', 'winreward', 'matchtime', 'pointlimit', 'channelid'];
        let validArgString = '';
        validArgs.forEach(arg => {
            validArgString += `${arg}\n`
        })
        if (validArgs.includes(args[0]) === false) return errorEmbed(message.channel, `**Invalid Argument *one***\nValid arguments:\n${validArgString}`)

        if (args[0] === validArgs[0]) {
            if (Boolean(args[1]) === false) return errorEmbed(message.channel, `**Invalid Argument *two***\nValid: true or false`)
            settings.enabled = args[1]
            settings.save()
            embed.setDescription(`Domination Enabled set to ${args[1]}`)
        }
        if (args[0] === validArgs[1]) {
            let time;
            try {
                time = ms(args[1])
            } catch (err) {
                return errorEmbed(message.channel, '**Invalid Argument *two***\nValid: 1d, 6h, 16m, etc.');
            }
            settings.newGameDelay = time;
            settings.save()
            embed.setDescription(`Domination new game delay set to ${args[1]}`)
        }
        if (args[0] === validArgs[2]) {
            if (isNaN(parseInt(args[1])) === false) {
                settings.rewardPerPoint = args[1]
                settings.save()
                embed.setDescription(`Domination reward per point set to ${args[1]}`)
            } else {
                return errorEmbed(message.channel, '**Invalid Argument *two***\nValid: Any whole number.')
            }
        }
        if (args[0] === validArgs[3]) {
            if (isNaN(parseInt(args[1])) === false) {
                settings.winReward = args[1]
                settings.save()
                embed.setDescription(`Domination win reward set to ${args[1]}`)
            } else {
                return errorEmbed(message.channel, '**Invalid Argument *two***\nValid: Any whole number.')
            }
        }
        if (args[0] === validArgs[4]) {
            let time;
            try {
                time = ms(args[1])
            } catch (err) {
                return errorEmbed(message.channel, '**Invalid Argument *two***\nValid: 1d, 6h, 16m, etc.');
            }
            settings.matchTime = time;
            settings.save()
            embed.setDescription(`Domination match time set to ${args[1]}`)
        }
        if (args[0] === validArgs[5]) {
            if (isNaN(parseInt(args[1])) === false) {
                settings.pointLimit = args[1];
                settings.save()
                embed.setDescription(`Domination game point score limit set to ${args[1]}`)
            } else {
                return errorEmbed(message.channel, '**Invalid Argument *two***\nValid: Any whole number.')
            }
        }
        if (args[0] === validArgs[6]) {
            if (isNaN(parseInt(args[1])) === false) {
                settings.channelID = args[1];
                settings.save()
                embed.setDescription(`Domination game channel set to #<${args[1]}>`)
            } else {
                return errorEmbed(message.channel, '**Invalid Argument *two***\nValid: Any whole number.')
            }
        }

        return message.channel.send(embed);

    }
}