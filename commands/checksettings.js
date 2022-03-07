const discordSettings = require('../models/discordServerSettingsSchema');
const dominationSettingsModel = require('../models/dominationSettingSchema');

module.exports = {
    name: 'checksettings',
    aliases: ['cs'],
    description: "View this discord's settings file",
    permissions: ["SEND_MESSAGES"],
    async execute(message, args, cmd, client, discord, mainGuild, guild) {


        let patron = false
        let guildOwner = mainGuild.members.cache.get(guild.owner.user.id);
        if (!guildOwner) return; // If guild owner is no longer in Cosmofficial discord

        if (guildOwner.roles.cache.has('883534965650882570') || guildOwner.roles.cache.has('883535930630213653')) {
            patron = true;
        }

        let settings = await discordSettings.findOne({
            guildID: guild.id
        })
        if (settings === null) {
            let createSettings = await discordSettings.create({
                guildID: guild.id,
                serverLogChannel: 'None',
                hotzoneChannel: 'None',
                chatRelayChannel: 'None',
                botCommandChannel: 'None'
            })
            await createSettings.save();
            settings = await discordSettings.findOne({
                guildID: guild.id
            })
        }


        let dominationSettings = await dominationSettingsModel.findOne({
            guildID: guild.id
        })
        if(dominationSettings === null) {
            dominationSettings = {};
            dominationSettings.channelID = ''
        } else if (dominationSettings.enabled === false) {
            dominationSettings.channelID = 'Domination Disabled'
        }
        const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle('Bot Configuration Info')
            .setURL('https://cosmofficial.herokuapp.com/')
            .setDescription('Showing current setting configuration')
            .addFields({
                name: 'Chat Relay Channel',
                value: `<#${settings.chatRelayChannel}>\nEdit command: c!es chatrelay {channelID}`
            }, {
                name: 'Bot Command Channel',
                value: `<#${settings.botCommandChannel}>\nEdit command: c!es commands {channelID}`
            }, {
                name: 'Server Log Channel',
                value: `<#${settings.serverLogChannel}>\nEdit command: c!es serverlog {channelID}`
            }, {
                name: 'Hot Zone Channel',
                value: patron ? `<#${settings.hotzoneChannel}>\nEdit command: c!es hotzone {channelID}` : 'Feature Locked'
            }, {
                name: 'Domination Channel',
                value: patron ? `<#${dominationSettings.channelID}>\nEdit command: c!eds channelid {channelID}` : 'Feature Locked'
            })
            .setFooter('Cosmofficial by POPINxxCAPS');
        message.channel.send(embed)
    }
}