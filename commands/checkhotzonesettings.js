const hotzoneSettingModel = require('../models/hotzoneSettingSchema');
const lockedEmbed = require('../functions_discord/lockedEmbed');
const errorEmbed = require('../functions_discord/errorEmbed');
const ms = require('ms');

module.exports = {
    name: 'checkhotzonesettings',
    aliases: ['chzs'],
    description: "Check the hotzone settings",
    permissions: ["SEND_MESSAGES"],
    async execute(message, args, cmd, client, discord, mainGuild, guild) {
        const current_time = Date.now();
        const defaultCleanupInterval = 3600 * 1000;
        const defaultNextCleanup = current_time + defaultCleanupInterval;
        const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle(`Hotzone Configuration`)
            .setURL('https://cosmofficial.herokuapp.com/')
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

        embed.addFields({
            name: 'Enabled',
            value: `**${settings.hotzoneEnabled}**\nEdit Command: c!ehzs enabled {true/false}\nTurns Hotzone  on/off.`
        }, {
            name: 'Interval',
            value: `**${ms(parseInt(settings.hotzoneInterval))}**\nEdit Command: c!ehzs interval {1d, 4h, 35m, etc}\nInterval between each zone.`
        }, {
            name: 'Timer',
            value: `**${ms(parseInt(settings.hotzoneTimer))}**\nHow long each zone lasts\nEdit Command: c!ehzs timer {1d, 4h, 35m, etc}\n`
        }, {
            name: 'Reward Per Second',
            value: `**${settings.hotzoneRewardPerSec}**\nEdit Command: c!ehzs rewardpersec {Number}\nAffects rewards for players sitting in the zone.`
        }, {
            name: 'End Bonus',
            value: `**${settings.hotzoneEndBonus}**\nEdit Command: c!ehzs endbonus {Number}\nBonus to award the highest surviving time on zone end.`
        }, {
            name: 'Radius',
            value: `**${settings.hotzoneRadius}**\nEdit Command: c!ehzs radius {Number}\nAffects the size of the zone itself. (In meters)`
        }, {
            name: 'Spawn Range',
            value: `**${settings.hotzoneSpawnRange}**\nEdit Command: c!ehzs spawnrange {Number}\nChanges the distance at which the zone can spawn from 0, 0. (In meters)`
        }, {
            name: 'Preset Zones',
            value: `**${settings.presetZones}**\nEdit Command: c!ehzs presetzones {true/false}\nToggles the use of preset locations defined with c!ahzl {x} {y} {z}\nIs random if false.`
        })
        return message.channel.send(embed);

    }
}