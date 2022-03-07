const discordSettings = require('../models/discordServerSettingsSchema');
const lockedEmbed = require('../functions_discord/lockedEmbed');
const errorEmbed = require('../functions_discord/errorEmbed')

module.exports = {
    name: 'editsettings',
    aliases: ['es'],
    description: "Edit this discord's settings file",
    permissions: ["ADMINISTRATOR"],
    async execute(message, args, cmd, client, discord, mainGuild, guild) {

        let guildOwner = mainGuild.members.cache.get(message.guild.owner.user.id);
        if (!guildOwner || guildOwner === null || guildOwner === undefined) return message.channel.send('The owner of this discord must be in the Cosmofficial discord to enable usage of this command.');
        let patron = false;
        if (guildOwner.roles.cache.has('883535930630213653') || guildOwner.roles.cache.has('883564396587147275')) {
            patron = true;
        }
        //if (patron === false) return lockedEmbed(message.channel, discord);


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

        let validArgs = ['hotzone', 'chatrelay', 'serverlog', 'commands']
        if(validArgs.includes(args[0]) === false) return errorEmbed(message.channel, 'Invalid argument. Check c!cs for valid channel edit commands.')


        if (args[0] === 'hotzone') {
            if(patron === false) return lockedEmbed(message.channel, discord)
            const channel = client.channels.cache.get(args[1]);
            if (channel === null || channel === undefined) return errorEmbed(message.channel, 'Channel not found. Ensure you are using a valid channel ID in Argument Two.')
            settings.hotzoneChannel = args[1];
            settings.save();
            message.channel.send(`Hotzone channel set to <#${args[1]}> successfully.`)
            
        }

        if (args[0] === 'chatrelay') {
            const channel = client.channels.cache.get(args[1]);
            if (channel === null || channel === undefined) return errorEmbed(message.channel, 'Channel not found. Ensure you are using a valid channel ID in Argument Two.');
            settings.chatRelayChannel = args[1];
            settings.save();
            message.channel.send(`Chat Relay channel set to <#${args[1]}> successfully.`)
            
        }

        if (args[0] === 'serverlog') {
            const channel = client.channels.cache.get(args[1]);
            if (channel === null || channel === undefined) return errorEmbed(message.channel, 'Channel not found. Ensure you are using a valid channel ID in Argument Two.')
            settings.serverLogChannel = args[1];
            settings.save();
            message.channel.send(`Server Log channel set to <#${args[1]}> successfully.`)
            
        }

        if (args[0] === 'commands') {
            const channel = client.channels.cache.get(args[1]);
            if (channel === null || channel === undefined) return errorEmbed(message.channel, 'Channel not found. Ensure you are using a valid channel ID in Argument Two.')
            settings.botCommandChannel = args[1];
            settings.save();
            message.channel.send(`Bot command channel set to <#${args[1]}> successfully.`)
        }



    }
}