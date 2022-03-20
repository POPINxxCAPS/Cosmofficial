const makeConfigVar = require('../functions_misc/makeConfigVar');
const statusModel = require('../models/statusSchema');
const chartSimSpeed = require('../functions_db/chartSimSpeed');
const errorEmbed = require('../functions_discord/errorEmbed');
const ms = require('ms');

module.exports = {
  name: 'lag',
  aliases: ['lag'],
  description: "Check this discords SE server status.",
  permissions: ["SEND_MESSAGES"],
  category: "General",
  async execute(req) {
    const message = req.message;
    const discord = req.discord;
    const mainGuild = req.mainGuild;
    const guild = req.guild;
    const current_time = Date.now();
    // Check if command should be ran
    let configCheck = await makeConfigVar(guild.id) // Check if config already created, if true, return message to channel
    if (configCheck === null) return message.channel.send('This discord does not have a server registered.\nUse c!setup to add your remote configuration.');

    // End remote server info initialization
    let infoData = await statusModel.findOne({
      guildID: message.guild.id
    })
    if (infoData === null) return errorEmbed(message.channel, `There was no server status document found for this server.\nJust connected your server? Allow up to 5 minutes for connection to be established.`)

    if (infoData.serverOnline === false) {
      const embed = new discord.MessageEmbed()
        .setColor('#E02A6B')
        .setTitle('Server Status')
        .setURL('https://cosmofficial.herokuapp.com/')
        .addFields({
          name: `Server is Offline`,
          value: `Can't reach the server!\nIt could be down or information queries may have broken.`
        }, )
        .setFooter('Cosmofficial by POPINxxCAPS');
      return message.channel.send(embed)
    }

    if (infoData.isReady === false && infoData.serverOnline === true) {
      const embed = new discord.MessageEmbed()
        .setColor('#E02A6B')
        .setTitle('Server Status')
        .setURL('https://cosmofficial.herokuapp.com/')
        .addFields({
          name: `Server Starting`,
          value: `The server is currently starting up.\nPlease wait a moment.`
        }, )
        .setFooter('Cosmofficial by POPINxxCAPS');
      return message.channel.send(embed)
    }


    let onlineStatus = infoData.serverOnline === false ? 'Offline' : 'Online';
    const embed = new discord.MessageEmbed()
      .setColor('#E02A6B')
      .setTitle('Server Manager')
      .setURL('https://cosmofficial.herokuapp.com/')
      .setDescription(`${infoData.serverName}\nLast Updated: ${ms((current_time - infoData.lastUpdated))} ago`)
      .addFields({
        name: 'Status',
        value: `${onlineStatus}`
      }, {
        name: 'Player Count',
        value: `${infoData.players}`
      }, {
        name: 'Server Sim Speed',
        value: `${infoData.simSpeed}`
      }, {
        name: 'Simulation CPU Load',
        value: `${infoData.simCPULoad}`
      }, {
        name: 'Used Pirate PCU',
        value: `${infoData.pirateUsedPCU}`
      }, {
        name: 'Total Used PCU',
        value: `${infoData.usedPCU}`
      }, {
        name: 'Game Version',
        value: `${infoData.version}`
      })
      .setFooter('Cosmofficial by POPINxxCAPS');


    // If patron, send charts too.

    try {
      message.channel.send(embed)
      chartSimSpeed(discord, guild, message.channel);
      return;
    } catch (err) {}

  }
}