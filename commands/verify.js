const makeConfigVar = require('../functions_misc/makeConfigVar');
const verificationModel = require('../models/verificationSchema');
const playerModel = require('../models/playerSchema');
const errorEmbed = require('../functions_discord/errorEmbed');
const verify = require('../functions_commands/verify');

// Noob code redo time
module.exports = {
    name: 'verify',
    aliases: ['verify'],
    description: "Link player username to discord",
    permissions: ["SEND_MESSAGES"],
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