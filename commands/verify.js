const remoteConfigModel = require('../models/remoteConfigSchema');
const verificationModel = require('../models/verificationSchema');
const playerModel = require('../models/playerSchema');
const errorEmbed = require('../functions_discord/errorEmbed');
const cooldownEmbed = require('../functions_discord/cooldownEmbed');
const cooldownFunction = require('../functions_db/cooldownFunction');
const verify = require('../functions_commands/verify');

// Noob code redo time
module.exports = {
    name: 'verify',
    aliases: ['verify'],
    description: "Link player username to discord",
    permissions: ["SEND_MESSAGES"],
    async execute(message, args, cmd, client, discord, mainGuild, guild) {
        if (args[0] === undefined) return errorEmbed(message.channel, 'Proper usage: c!verify {username}\nUse your in-game username.')
        // Combine args to get username
        let search = args[0];
        for (let v = 1; v < args.length; v++) {
            search = search + ' ' + args[v];
        }

        await verify(search, message.author.id, message.guild.id, message.channel.id);
    }
}