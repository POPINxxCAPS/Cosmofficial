let playerEcoModel = require('../models/playerEcoSchema');
const errorEmbed = require('../functions/discord/errorEmbed');
const rewardFaction = require('../functions/misc/rewardFaction');
const playerModel = require('../models/playerSchema');
module.exports = {
    name: "rewardfaction",
    aliases: ['rf'],
    permissions: ["ADMINISTRATOR"],
    description: "Send a currency reward split between a player's faction.\nc!rf {factionTag} {amount}",
    category: "Cosmic",
    categoryAliases: [],
    async execute(req) {
        const args = req.args;
        const config = req.config;
        const message = req.message;
        const factionTag = args[0];
        if(factionTag === undefined) return errorEmbed(message.channel, 'Argument *one*: Faction tag is required.')
        let playerDoc = await playerModel.findOne({
            guildID: message.guild.id,
            factionTag: factionTag
        })
        if(playerDoc === null) return errorEmbed(message.channel, "Argument *two*: Faction tag was not found.");
        const amount = args[1];
        if (amount % 1 != 0 || amount <= 0) return errorEmbed(message.channel, 'Argument *two*: Reward amount must be a whole number.');
        await rewardFaction(message.guild.id, factionTag, parseInt(amount));
        message.channel.send("test complete")
    }
};