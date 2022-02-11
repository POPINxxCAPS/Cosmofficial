const dominationSettingModel = require('../models/dominationSettingSchema');
const lockedEmbed = require('../functions_discord/lockedEmbed');
const errorEmbed = require('../functions_discord/errorEmbed');
const ms = require('ms');

module.exports = {
    name: 'adddominationpoint',
    aliases: ['adp'],
    description: "Add a domination point",
    permissions: ["ADMINISTRATOR"],
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

        if (args[0] === undefined) return errorEmbed(message.channel, '**Invalid Argument *one***\nPlease enter a point name. (One-Word)')
        if(settings.objectives.length > 4) return errorEmbed(message.channel, 'Maximum of 5 objectives.\nRemove some objectives and try again.')
        let objFound = false;
        settings.objectives.forEach(obj => {
            if (obj.name === args[0]) {
                objFound = true;
            }
        })

        if (objFound === true) return errorEmbed(message.channel, '**Error**: Name already exists.')
        settings.objectives.push({
            name: args[0],
            enabled: false,
            x: '0',
            y: '0',
            z: '0',
            pointRadius: '1000',
            capturePercentage: '0',
            capturedBy: 'Neutral'
        })
        settings.save();
        embed.setDescription(`Point with the name **${args[0]}** added.\nUse c!cdp to view all current points.`)
        return message.channel.send(embed);

    }
}