const hooverSettingModel = require('../models/hooverSettingSchema');
const lockedEmbed = require('../functions_discord/lockedEmbed');
const errorEmbed = require('../functions_discord/errorEmbed');
const ms = require('ms');

module.exports = {
    name: 'edithooversettings',
    aliases: ['ehs'],
    description: "Edit the grid cleanup settings",
    permissions: ["ADMINISTRATOR"],
    async execute(message, args, cmd, client, discord, mainGuild, guild) {
        const current_time = Date.now();
        const defaultCleanupInterval = 3600 * 1000;
        const defaultNextCleanup = current_time + defaultCleanupInterval;
        const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle(`Hoover Configuration`)
            .setURL('https://cosmofficial.herokuapp.com/')
            .setFooter('Cosmofficial by POPINxxCAPS')

        let patron = false
        let guildOwner = mainGuild.members.cache.get(guild.owner.user.id);
        if (!guildOwner) return; // If guild owner is no longer in Cosmofficial discord

        if (guildOwner.roles.cache.has('883534965650882570') || guildOwner.roles.cache.has('883535930630213653')) {
            patron = true;
        }
        //if (patron === false) return lockedEmbed(message.channel, discord); Disabled to make free


        let settings = await hooverSettingModel.findOne({
            guildID: guild.id
        })
        if (settings === null) {
            await hooverSettingModel.create({
                guildID: guild.id,
                hooverEnabled: false,
                nextCleanup: defaultNextCleanup,
                cleanupInterval: defaultCleanupInterval,
                unpoweredGridRemoval: false,
                largeGridAllowed: true,
                smallGridAllowed: true,
                blockThreshold: '5',
                cleanUnverifiedPlayerGrids: false
            })
            settings = await hooverSettingModel.findOne({
                guildID: guild.id
            })
        }

        let validArgs = ['hooverenabled', 'cleanupinterval', 'unpoweredgridremoval', 'largegridallowed', 'smallgridallowed', 'blockthreshold', 'unverifiedcleanup'];
        let validArgString = '';
        validArgs.forEach(arg => {
            validArgString += `${arg}\n`
        })
        if (validArgs.includes(args[0]) === false) return errorEmbed(message.channel, `**Invalid Argument *one***\nValid arguments:\n${validArgString}`)

        if (args[0] === validArgs[0]) {
            if (Boolean(args[1]) === false) return errorEmbed(message.channel, `**Invalid Argument *two***\nValid arguments: true or false`)
            settings.hooverEnabled = args[1]
            settings.save()
            embed.setDescription(`Hoover Enabled set to ${args[1]}`)
        }
        if (args[0] === validArgs[1]) { // If interval
            let timeValue;
            try {
                timeValue = ms(args[1]);
            } catch (err) {
                return errorEmbed(message.channel, `**Invalid Argument *two***\nValid arguments: 1d, 4hr, 36m, etc.`)
            }
            if(timeValue < 599000) return errorEmbed(message.channel,discord, `For bot performance, the clean-up scan interval may not be less than 10 minutes.`)
            settings.cleanupInterval = timeValue;
            settings.nextCleanup = timeValue + current_time;
            let nextCleanup = ms(parseInt(settings.nextCleanup - current_time));
            settings.save()
            embed.setDescription(`Cleanup Interval set to ${args[1]}. Next cleanup: ${nextCleanup}`)
        }
        if (args[0] === validArgs[2]) { // Unpowered grid removal
            if (Boolean(args[1]) === false) return errorEmbed(message.channel, `**Invalid Argument *two***\nValid arguments: true or false`)
            settings.unpoweredGridRemoval = args[1]
            settings.save()
            embed.setDescription(`Unpowered Grid Removal set to ${args[1]}`)
        }
        if (args[0] === validArgs[3]) { // Large grid allowed
            if (Boolean(args[1]) === false) return errorEmbed(message.channel, `**Invalid Argument *two***\nValid arguments: true or false`)
            settings.largeGridAllowed = args[1]
            settings.save()
            embed.setDescription(`Large Grid Allowed set to ${args[1]}`)
        }
        if (args[0] === validArgs[4]) { // Small grid allowed
            if (Boolean(args[1]) === false) return errorEmbed(message.channel, `**Invalid Argument *two***\nValid arguments: true or false`)
            settings.smallGridAllowed = args[1]
            settings.save()
            embed.setDescription(`Small Grid Allowed set to ${args[1]}`)
        }
        if (args[0] === validArgs[5]) { // Block threshold
            let argument = parseInt(args[1]);
            if (argument === NaN) return errorEmbed(message.channel, `**Invalid Argument *two***\nValid arguments: Any Whole number`)
            settings.blockThreshold = argument;
            settings.save();
            embed.setDescription(`Block Threshold set to ${args[1]}`)
        }
        if (args[0] === validArgs[6]) { // Un-verified grid cleanup
            if (patron === false) return lockedEmbed(message.channel, discord);
            if (Boolean(args[1]) === false) return errorEmbed(message.channel, `**Invalid Argument *two***\nValid arguments: true or false`)
            settings.cleanUnverifiedPlayerGrids = args[1]
            settings.save()
            embed.setDescription(`Unverified Grid Cleanup set to ${args[1]}`);
        }

        return message.channel.send(embed);

    }
}