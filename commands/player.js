const playerModel = require('../models/playerSchema');
const ms = require('ms');
const chartPlayerActivity = require('../functions/database/chartPlayerActivity');
const errorEmbed = require('../functions/discord/errorEmbed');
const banModel = require('../models/banSchema');

const validArgs = ['ban'];
module.exports = {
  name: 'players',
  aliases: ['players'],
  description: "List online players and information about them.",
  permissions: ["SEND_MESSAGES"],
  category: "General",
    categoryAliases: ['general'],
  async execute(req) {
    const message = req.message;
    const discord = req.discord;
    const mainGuild = req.mainGuild;
    const guild = req.guild;
    const current_time = Date.now();
    

  }
}