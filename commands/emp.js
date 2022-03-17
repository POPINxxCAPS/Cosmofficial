const lockedEmbed = require('../functions_discord/lockedEmbed');
const errorEmbed = require('../functions_discord/errorEmbed');
const commandPriceModel = require('../models/commandPriceSchema');

const validCommandNames = ['emp'];
module.exports = {
    name: 'emp',
    aliases: [],
    description: "Emp's all grids within 2km for 15 seconds.\nThis can be countered with a simple power cycle.\n(Unfinished, command doesn't do anything)",
    permissions: ["SEND_MESSAGES"],
    category: "Combat",
    async execute(req) {
        const message = req.message;
        const discord = req.discord;
        const mainGuild = req.mainGuild;
        
    }
}