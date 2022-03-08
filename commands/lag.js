const remoteConfigModel = require('../models/remoteConfigSchema');
const statusModel = require('../models/statusSchema');
const chartSimSpeed = require('../functions_db/chartSimSpeed');
const ms = require('ms');

module.exports = {
  name: 'lag',
  aliases: ['lag'],
  description: "Check this discords SE server information",
  permissions: ["SEND_MESSAGES"],
  async execute(req) {
    const message = req.message;
    const discord = req.discord;
    const mainGuild = req.mainGuild;
    const guild = req.guild;
    const current_time = Date.now();
    // Check if command should be ran
    let configCheck = await remoteConfigModel.findOne({
      guildID: guild.id
    }) // Check if config already created, if true, return message to channel
    if (configCheck === null) return message.channel.send('This discord does not have a server registered.\nUse c!setup to add your remote configuration.');

    // End remote server info initialization
    let infoData = await statusModel.findOne({
      guildID: message.guild.id
    })
    if (infoData === null) return message.channel.send('Unknown Error Occurred. Try again in 30 seconds.');

    if (infoData.online === false) {
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

    if (infoData.isReady === false && infoData.online === true) {
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


    let onlineStatus = infoData.online ? 'Offline' : 'Online';
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
      let patron;
      if (guild.owner === null) return; // Redundancy Check
      let guildOwner = mainGuild.members.cache.get(guild.owner.user.id);
      if (!guildOwner) return; // If guild owner is no longer in Cosmofficial discord

      if (guildOwner.roles.cache.has('883534965650882570') || guildOwner.roles.cache.has('883535930630213653')) {
        patron = true;
      }
      if (patron === undefined) return;
      chartSimSpeed(discord, guild, message.channel);
      return;
    } catch (err) {}

  }
}