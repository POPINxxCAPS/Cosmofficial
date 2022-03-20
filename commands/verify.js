const makeConfigVar = require('../functions/misc/makeConfigVar');
const verificationModel = require('../models/verificationSchema');
const playerModel = require('../models/playerSchema');
const errorEmbed = require('../functions/discord/errorEmbed');
const verify = require('../functions/commands/verify');

// Noob code redo time
module.exports = {
    name: 'verify',
    aliases: ['verify'],
    description: "Links player username to discord user ID.\nEnables the bot to recognize you for certain features.",
    permissions: ["SEND_MESSAGES"],
    category: "General",
    async execute(req) {
        const message = req.message;
        const args = req.args;
        if (args[0] === undefined) return errorEmbed(message.channel, 'Proper usage: c!verify {username}\nUse your in-game username.')
        // Combine args to get username
        let search = args[0];
        for (let v = 1; v < args.length; v++) {
            search = search + ' ' + args[v];
        }

        await verify(search, message.author.id, message.channel);
    }
}