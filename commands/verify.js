const remoteConfigModel = require('../models/remoteConfigSchema');
const verificationModel = require('../models/verificationSchema');
const playerModel = require('../models/playerSchema');
const errorEmbed = require('../functions_discord/errorEmbed');
const cooldownEmbed = require('../functions_discord/cooldownEmbed');
const cooldownFunction = require('../functions_db/cooldownFunction');

module.exports = {
    name: 'verify',
    aliases: ['verify'],
    description: "Link player username to discord",
    permissions: ["SEND_MESSAGES"],
    async execute(message, args, cmd, client, discord, mainGuild, guild) {
        let searchString = args[0];
        for (let v = 1; v < args.length; v++) {
            searchString = searchString + ' ' + args[v];
        }
        let checkOne = await verificationModel.findOne({
            userID: message.author.id
        })
        if(checkOne !== null && args[0] === undefined) return errorEmbed(message.channel, discord, `Your discord account is currently linked to ${checkOne.username}.\nYou may change it once every 3 days with c!verify {username}`)
        let checkTwo = await verificationModel.findOne({
            username: searchString
        });
        if (args[0] === undefined) return errorEmbed(message.channel, discord, 'Proper usage: c!verify {username}\nUse your in-game username.')

        if (checkTwo !== null) return errorEmbed(message.channel, discord, 'This gamertag is already registered to a discord account.')

        let config = await remoteConfigModel.findOne({
            guildID: guild.id
        }) // Check if config already created, if true, return message to channel
        if (config === null) return message.channel.send('This discord does not have a server registered.\nUse c!setup to add your remote configuration.');


        // Look for GT, if found, continue verification
        let targetPlayer = await playerModel.findOne({
            guildID: guild.id,
            displayName: searchString
        })
        if (targetPlayer === null) return errorEmbed(message.channel, discord, 'Entered username was not found in the database.\nHave you logged into the server?\nIf you are having trouble, use c!players while logged in to see the username reported by Space Engineers.')
        //if(targetPlayer.online === false) return message.channel.send('User is not *online*')


        
        let string = '';
        if (checkOne !== null) {
            const cooldown = await cooldownFunction.cd('verify', 259200);
            if (cooldown !== undefined) {
                return cooldownEmbed(message.channel, discord, cooldown, 'Timely', message.author.id)
            }
            if(checkOne.username === searchString) return errorEmbed(message.channel, discord, `<@${message.author.id}> is already linked to ${searchString}!`)
            await checkOne.remove();
            string = `${targetPlayer.displayName} successfully registered to <@${message.author.id}>!\nUnlinked from previous username.`
        } else {
            string = `${targetPlayer.displayName} successfully registered to <@${message.author.id}>!`
        }

        let create = await verificationModel.create({
            userID: message.author.id,
            username: targetPlayer.displayName
        })
        create.save();
        try {
            message.channel.send(string)
        } catch (err) {}
    }
}