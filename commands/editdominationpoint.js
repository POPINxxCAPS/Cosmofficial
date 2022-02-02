const dominationSettingModel = require('../models/dominationSettingSchema');
const lockedEmbed = require('../functions_discord/lockedEmbed');
const errorEmbed = require('../functions_discord/errorEmbed');
const ms = require('ms');


module.exports = {
    name: 'editdominationpoint',
    aliases: ['edp'],
    description: "Edit a domination point",
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

        let validArgs = ['enabled', 'pointradius', 'x', 'y', 'z'];

        if (args[0] === undefined) return errorEmbed(message.channel, discord, '**Invalid Argument *one***\nPlease enter a point name. (One-Word)')

        let objFound = false;
        let error = false;
        await settings.objectives.forEach(obj => {
            if (obj.name === args[0]) {
                objFound = true;
                if (validArgs.includes(args[1]) === true) {
                    if (args[1] === validArgs[0]) {
                        if (args[2] === 'true' || args[2] === 'false') {
                            obj.enabled = args[2]
                            embed.setDescription(`Point **${args[0]}** enabled set to **${args[2]}**.\nUse c!cdp to view all current points.`)
                        } else {
                            errorEmbed(message.channel, discord, '**Invalid Argument *three***\nValid: true or false')
                            error = true
                        }
                    }
                    if (args[1] === validArgs[1]) { // Radius
                        if (Number(args[2])) {
                            embed.setDescription(`Point **${args[0]}** radius set to **${args[2]}**.\nUse c!cdp to view all current points.`)
                            obj.pointRadius = args[2]
                        } else {
                            errorEmbed(message.channel, discord, '**Invalid Argument *three***\nValid: true or false')
                            error = true
                        }
                    }
                    if (args[1] === validArgs[2]) { // X
                        if (Number(args[2])) {
                            embed.setDescription(`Point **${args[0]}** X position set to **${args[2]}**.\nUse c!cdp to view all current points.`)
                            obj.x = args[2]
                        } else {
                            errorEmbed(message.channel, discord, '**Invalid Argument *three***\nValid: true or false')
                            error = true
                        }
                    }
                    if (args[1] === validArgs[3]) { // Y
                        if (Number(args[2])) {
                            embed.setDescription(`Point **${args[0]}** Y position set to **${args[2]}**.\nUse c!cdp to view all current points.`)
                            obj.y = args[2]
                        } else {
                            errorEmbed(message.channel, discord, '**Invalid Argument *three***\nValid: true or false')
                            error = true
                        }
                    }
                    if (args[1] === validArgs[4]) { // Z
                        if (Number(args[2])) {
                            embed.setDescription(`Point **${args[0]}** Z position set to **${args[2]}**.\nUse c!cdp to view all current points.`)
                            obj.z = args[2]
                        } else {
                            errorEmbed(message.channel, discord, '**Invalid Argument *three***\nValid: true or false')
                            error = true
                        }
                    }

                } else {
                    errorEmbed(message.channel, discord, '**Invalid Argument *two***\nValid: enabled, pointradius')
                    error = true
                }
            }
        })
        if (objFound === false) return errorEmbed(message.channel, discord, '**Error**: Point name does not exist.')
        if (error === true) return;
        settings.save()
        return message.channel.send(embed);

    }
}