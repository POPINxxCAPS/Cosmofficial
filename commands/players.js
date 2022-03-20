const playerModel = require('../models/playerSchema');
const ms = require('ms');
const chartPlayerActivity = require('../functions_db/chartPlayerActivity');
const errorEmbed = require('../functions_discord/errorEmbed');

module.exports = {
  name: 'players',
  aliases: ['players'],
  description: "List online players and information about them.",
  permissions: ["SEND_MESSAGES"],
  category: "General",
  async execute(req) {
    const message = req.message;
    const discord = req.discord;
    const mainGuild = req.mainGuild;
    const guild = req.guild;
    let current_time = Date.now();
    let playerDocs = await playerModel.find({
      guildID: guild.id,
      online: true
    });

    const embed = new discord.MessageEmbed()
      .setColor('#E02A6B')
      .setTitle('Player Info')
      .setURL('https://cosmofficial.herokuapp.com/')
      .setFooter('Cosmofficial by POPINxxCAPS');
    if (playerDocs === [] || playerDocs === undefined || playerDocs === null) return errorEmbed(message.channel, "There are no player documents. Is your server configured?\nRemote Configuration: *c!settings remote*")
    playerDocs.forEach(doc => {
      let numToAvg = 0;
      doc.loginHistory.forEach(loginHisDoc => {
        if (isNaN(loginHisDoc.logout - loginHisDoc.login)) {} else {
          numToAvg += (loginHisDoc.logout - loginHisDoc.login)
        }
      })
      let averageLogin;
      if (numToAvg === 0) {
        averageLogin = 0;
      } else {
        averageLogin = numToAvg / doc.loginHistory.length
      }
      embed.addFields({
        name: `${doc.displayName}`,
        value: `Faction: ${doc.factionName}\nFaction Tag: ${doc.factionTag}\nLogged in for: ${ms((current_time - parseInt(doc.lastLogin)))}\nAverage Playtime: ${ms(averageLogin)}`
      })
    })
    if (playerDocs.length === 0) {
      embed.setDescription('No players online!')
    }
    try {
      message.channel.send(embed)
      return chartPlayerActivity(discord, guild, message.channel);
    } catch (err) {};
  }
}