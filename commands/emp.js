const lockedEmbed = require('../functions_discord/lockedEmbed');
const errorEmbed = require('../functions_discord/errorEmbed');
const commandPriceModel = require('../models/commandPriceSchema');

const validCommandNames = ['emp'];
module.exports = {
    name: 'emp',
    aliases: [],
    description: "Set the price for a command",
    permissions: ["SEND_MESSAGES"],
    async execute(req) {
        const message = req.message;
        const discord = req.discord;
        const mainGuild = req.mainGuild;
        let guildOwner = mainGuild.members.cache.get(message.guild.owner.user.id);
        if (!guildOwner || guildOwner === null || guildOwner === undefined) return message.channel.send('The owner of this discord must be in the Cosmofficial discord to enable usage of this command.');
        let patron = false;
        if (guildOwner.roles.cache.has('883535930630213653') || guildOwner.roles.cache.has('883564396587147275')) {
            patron = true;
        }
        if (patron === false) return lockedEmbed(message.channel, discord);
    }
}