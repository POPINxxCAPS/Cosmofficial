const dominationSettingModel = require('../models/dominationSettingSchema');
const lockedEmbed = require('../functions_discord/lockedEmbed');
const errorEmbed = require('../functions_discord/errorEmbed');
const ms = require('ms');

module.exports = {
    name: 'checkdominationpoints',
    aliases: ['cdp'],
    description: "Check the domination settings",
    permissions: ["ADMINISTRATOR"],
    async execute(req) {
        const message = req.message;
        const discord = req.discord;
        const mainGuild = req.mainGuild;
        const guild = req.guild;
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

        settings.objectives.forEach(obj => {
            embed.addFields({
                name: `${obj.name}`,
                value: `Enabled: **${obj.enabled}**\nEdit Command: c!edp ${obj.name} enabled {true/false}\n
                Zone Radius: **${obj.pointRadius}**\nEdit Command: c!edp ${obj.name} pointradius {Number}\n
                X Position: **${obj.x}**\nEdit Command: c!edp ${obj.name} x {Number}\n
                Y Position: **${obj.y}**\nEdit Command: c!edp ${obj.name} y {Number}\n
                Z Position: **${obj.z}**\nEdit Command: c!edp ${obj.name} z {Number}\n
                Delete Command: c!rdp ${obj.name}`
            });
        })
        if (settings.objectives.length === 0) {
            embed.addFields({
                name: 'No objective points set!',
                value: 'Use c!adp {name} to add a point and get started.'
            })
        }
        return message.channel.send(embed);

    }
}