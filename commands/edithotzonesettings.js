const hotzoneSettingModel = require('../models/hotzoneSettingSchema');
const lockedEmbed = require('../functions_discord/lockedEmbed');
const errorEmbed = require('../functions_discord/errorEmbed');

module.exports = {
    name: 'edithotzonesettings',
    aliases: ['ehzs'],
    description: "Edit the hotzone settings",
    permissions: ["ADMINISTRATOR"],
    async execute(message, args, cmd, client, discord, mainGuild, guild) {
        const current_time = Date.now();
        const embed = new discord.MessageEmbed()
        .setColor('#E02A6B')
        .setTitle(`Hotzone Configuration`)
        .setURL('https://mod.io/members/popinuwu')
        .setFooter('Cosmofficial by POPINxxCAPS')

        let guildOwner = mainGuild.members.cache.get(message.guild.owner.user.id);
        if (!guildOwner || guildOwner === null || guildOwner === undefined) return message.channel.send('The owner of this discord must be in the Cosmofficial discord to enable usage of this command.');
        let eventPackage;
        if (guildOwner.roles.cache.has('854211115915149342') || guildOwner.roles.cache.has('883535930630213653') || guildOwner.roles.cache.has('883534965650882570')) {
            eventPackage = true;
        }
        if (eventPackage === undefined) return lockedEmbed(message.channel, discord);


        let settings = await hotzoneSettingModel.findOne({
            guildID: guild.id
        })
        if (settings === null) {
            await hotzoneSettingModel.create({
                guildID: guild.id,
                hotzoneEnabled: false,
                hotzoneInterval: '21600000',
                hotzoneTimer: '3600000',
                hotzoneRewardPerSec: '100',
                hotzoneEndBonus: '250000',
                hotzoneRadius: '1000',
                hotzoneSpawnRange: '2000000',
                presetZones: false,
                presetLocations: []
            })
            settings = await hotzoneSettingModel.findOne({
                guildID: guild.id
            })
        }


        let validArgs = ['enabled', 'interval', 'timer', 'rewardpersec', 'endbonus', 'radius', 'spawnrange', 'presetzones '];
        let validArgString = '';
        validArgs.forEach(arg => {
            validArgString += `${arg}\n`
        })
        if(validArgs.includes(args[0]) === false) return errorEmbed(message.channel, discord, `**Invalid Argument *one***\nValid arguments:\n${validArgString}`)

        if(args[0] === validArgs[0]) {
            if(Boolean(args[1]) === false) return errorEmbed(message.channel, discord, `**Invalid Argument *two***\nValid arguments: true or false`)
            settings.hotzoneEnabled = args[1]
            settings.save()
            embed.setDescription(`Hotzone Enabled set to ${args[1]}`)
        }
        if(args[0] === validArgs[1]) {}
        if(args[0] === validArgs[2]) {}
        if(args[0] === validArgs[3]) {}
        if(args[0] === validArgs[4]) {}
        if(args[0] === validArgs[5]) {}
        if(args[0] === validArgs[6]) { 
            if(parseInt(args[1]) === NaN) return errorEmbed(message.channel, discord, '**Invalid Argument *two**\nValid: Whole Number');
            settings.spawnRange = args[1];
            settings.save();
            embed.setDescription(`Hotzone Spawn Range set to ${args[1]}`)
        }
        if(args[0] === validArgs[7]) {}
        
        return message.channel.send(embed);

    }
}