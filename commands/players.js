const playerModel = require('../models/playerSchema');
const discordServerSettings = require('../models/discordServerSettingsSchema');
const ms = require('ms');
const chartPlayerActivity = require('../functions_db/chartPlayerActivity');

module.exports = {
  name: 'players',
  aliases: ['players'],
  description: "List online players",
  permissions: ["SEND_MESSAGES"],
  async execute(message, args, cmd, client, discord, mainGuild, guild) {
    let current_time = Date.now();

    // Check if owner has adminstration package
    let patron;
    if (guild.owner === null) return; // Redundancy Check
    let guildOwner = mainGuild.members.cache.get(guild.owner.user.id);
    if (!guildOwner) return; // If guild owner is no longer in Cosmofficial discord

    if (guildOwner.roles.cache.has('883534965650882570') || guildOwner.roles.cache.has('883535930630213653')) {
      patron = true;
    }

    if (patron === true) {
      let playerDocs = await playerModel.find({
        guildID: guild.id,
        online: true
      });


      const embed = new discord.MessageEmbed()
        .setColor('#E02A6B')
        .setTitle('Player Info')
        .setURL('https://cosmofficial.herokuapp.com/')
        .setFooter('Cosmofficial by POPINxxCAPS');
      if (playerDocs === [] || playerDocs === undefined || playerDocs === null) {
        embed.setDescription(`Can't reach the server. It may be offline.`)
      } else {
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
        if(playerDocs.length === 0) {
          embed.setDescription('No players online!')
        }
      }
      try {
        message.channel.send(embed)
        return chartPlayerActivity(discord, guild, message.channel);
      } catch (err) {};

    } else { // If not patron, simple username relay
      let playerDocs = await playerModel.find({
        guildID: guild.id,
        online: true
      });
      let playersString = '';
      for (i = 0; i < playerDocs.length; i++) {
        if (playerDocs[i].displayName !== '') {
          playersString += `${playerDocs[i].displayName}\n`;
        }
      }
      if (playersString === '') {
        const settings = await discordServerSettings.findOne({
          guildID: message.guild.id
        });
        if (settings.serverOnline === false) {
          playersString = 'The server is either offline or queries have broken.'
        } else {
          playersString = 'No players online.'
        }
      }
      const embed = new discord.MessageEmbed()
        .setColor('#E02A6B')
        .setTitle('Player Info')
        .setURL('https://cosmofficial.herokuapp.com/')
        .addFields({
          name: 'Online Players',
          value: `${playersString}`
        }, )
        .setFooter('Cosmofficial by POPINxxCAPS');

      try {
        return message.channel.send(embed)
      } catch (err) {}
    }
  }
}