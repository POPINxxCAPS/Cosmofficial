const dominationSettingModel = require('../models/dominationSettingSchema');
const lockedEmbed = require('../functions_discord/lockedEmbed');
const errorEmbed = require('../functions_discord/errorEmbed');
const ms = require('ms');

module.exports = {
    name: 'checkdominationsettings',
    aliases: ['cds'],
    description: "Check the domination settings",
    permissions: ["SEND_MESSAGES"],
    async execute(message, args, cmd, client, discord, mainGuild, guild) {
        const current_time = Date.now();
        const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle(`Domination Configuration`)
            .setURL('https://mod.io/members/popinuwu')
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
                enabled: false,
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

        if(settings.channelID === undefined) {
            settings.channelID = 'Not Set'
        }
        embed.addFields({
            name: 'Enabled',
            value: `**${settings.enabled}**\nEdit Command: c!eds enabled {true/false}\nTurns domination on/off.`
        }, {
            name: 'Interval',
            value: `**${ms(parseInt(settings.newGameDelay))}**\nEdit Command: c!eds newgamedelay {1d, 4h, 35m, etc}\nInterval between each game.`
        }, {
            name: 'Timer',
            value: `**${ms(parseInt(settings.matchTime))}**\nEdit Command: c!eds matchtime {1d, 4h, 35m, etc}\nHow long each game lasts.`
        }, {
            name: 'Reward Per Point',
            value: `**${settings.rewardPerPoint}**\nEdit Command: c!eds rewardperpoint {Number}\nAmount to reward for each point gained.\nSplit between all faction members.`
        }, {
            name: 'Winning Reward',
            value: `**${settings.winReward}**\nEdit Command: c!eds winreward {Number}\nReward to grant the winner.`
        }, {
            name: 'Point Limit',
            value: `**${settings.pointLimit}**\nEdit Command: c!eds pointlimit {Number}\nSets how many points are needed to win the match.\nIf not reached, winner is the team with the most points.`
        }, {
            name: 'Capture Time',
            value: `**${ms(parseInt(settings.captureTime))}**\nEdit Command: c!eds pointlimit {Number}\nSets how many points are needed to win the match.\nIf not reached, winner is the team with the most points.`
        }, {
            name: 'Objective Count',
            value: `**${settings.objectives.length}**\nManage your objective points: c!cdp\nHow many objectives you currently have configured.`
        }, {
            name: 'Channel',
            value: `<#${settings.channelID}>\nEdit command: c!eds channelid {channelID}\nWhich channel to use for game updates.`
        });
        return message.channel.send(embed);

    }
}