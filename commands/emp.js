const lockedEmbed = require('../functions/discord/lockedEmbed');
const errorEmbed = require('../functions/discord/errorEmbed');
const commandPriceModel = require('../models/commandPriceSchema');

const validCommandNames = ['emp'];
module.exports = {
    name: 'emp',
    aliases: [],
    description: "Emp's all grids within 2km for 15 seconds.\nThis can be countered with a simple power cycle.\n(Unfinished, command doesn't do anything)",
    permissions: ["SEND_MESSAGES"],
    category: "Combat",
    categoryAliases: ['combat'],
    async execute(req) {
        const message = req.message;
        const discord = req.discord;
        const mainGuild = req.mainGuild;
        
    }
}