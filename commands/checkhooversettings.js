const hooverSettingModel = require('../models/hooverSettingSchema');
const lockedEmbed = require('../functions_discord/lockedEmbed');
const ms = require('ms');

module.exports = {
    name: 'checkhooversettings',
    aliases: ['chs'],
    description: "Edit the grid cleanup settings",
    permissions: ["SEND_MESSAGES"],
    async execute(req) {
        const message = req.message;
        const discord = req.discord;
        const mainGuild = req.mainGuild;
        const guild = req.guild;
        const current_time = Date.now();
        const defaultCleanupInterval = 3600 * 1000;
        const defaultNextCleanup = current_time + defaultCleanupInterval;

        let patron = false
        let guildOwner = mainGuild.members.cache.get(guild.owner.user.id);
        if (!guildOwner) return; // If guild owner is no longer in Cosmofficial discord

        if (guildOwner.roles.cache.has('883534965650882570') || guildOwner.roles.cache.has('883535930630213653')) {
            patron = true;
        }
        // if (patron === false) return lockedEmbed(message.channel, discord); Disabled to make it free


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
        let timeRemaining;
        try {
            timeRemaining = ms(parseInt(settings.nextCleanup - current_time));
        } catch (err) {
            timeRemaining = 'Invalid'
        }
        const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle(`Hoover Configuration`)
            .setURL('https://cosmofficial.herokuapp.com/')
            .setFooter('Cosmofficial by POPINxxCAPS')
            .setDescription(`Next Cleanup Scan: ${timeRemaining}`)
            .addFields({
                name: 'Hoover Enabled',
                value: `**${settings.hooverEnabled}**\nEdit Command: c!ehs hooverenabled {true/false}\nTurns hoover cleanup on/off.`
            }, {
                name: 'Cleanup Scan Interval',
                value: `**${ms(parseInt(settings.cleanupInterval), { long: true })}**\nEdit Command: c!ehs cleanupinterval {time value}\nSets the rate at which the cleanups should happen.`
            }, {
                name: 'Unpowered Grid Removal',
                value: `**${settings.unpoweredGridRemoval}**\nEdit Command: c!ehs unpoweredgridremoval {true/false}\nDeletes all unpowered grids if true.`
            }, {
                name: 'Large Grids Allowed',
                value: `**${settings.largeGridAllowed}**\nEdit Command: c!ehs largegridallowed {true/false}\nDeletes all large grids if false.`
            }, {
                name: 'Small Grids Allowed',
                value: `**${settings.smallGridAllowed}\n**Edit Command: c!ehs smallgridallowed {true/false}\nDeletes all small grids if false.`
            }, {
                name: 'Block Threshold',
                value: `**${settings.blockThreshold}\n**Edit Command: c!ehs blockthreshold {true/false}\nDeletes anything below this block count.`
            }, {
                name: 'Unverified Grid Cleanup',
                value: `**${patron ? settings.cleanUnverifiedPlayerGrids : 'Locked'}**\nEdit Command: c!ehs unverifiedcleanup {true/false}\nDeletes all grids not belonging to a player that has verified with c!verify. This prevents alt accounts and also deletes grids of players that leave your discord automatically.`
            })

        return message.channel.send(embed);

    }
}