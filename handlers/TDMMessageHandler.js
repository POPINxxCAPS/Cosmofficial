const TDMQueueModel = require('../models/TDMQueueSchema');
const TDMMatchModel = require('../models/TDMMatchSchema');
const discord = require('discord.js');
const ms = require('ms');

const updateQueue = async (client) => {
  const guild = client.guilds.cache.get("853247020567101440");
  const channel = client.channels.cache.get("884107246689218580");

  let queuedPlayerString = '';
  let queueDocs = await TDMQueueModel.find({});
  if (queueDocs[0] === undefined) {
    queuedPlayerString = 'N/A';
  } else {
    await queueDocs.forEach(player => {
      queuedPlayerString = queuedPlayerString + `${player.username}\n`;
    });
  }

  if (queuedPlayerString === '') {
    queuedPlayerString = 'N/A';
  }
  const embed = new discord.MessageEmbed()
    .setColor('#E02A6B')
    .setTitle('Cosmic TDM')
    .setURL('https://www.patreon.com/Cosmofficial')
    .setDescription('Showing currently queued players')
    .addFields({
      name: `Queued Players:`,
      value: `${queuedPlayerString}`
    }, )
    .setFooter('Cosmofficial by POPINxxCAPS');

    try {
      await channel.bulkDelete(2);

    } catch(err) {} 
  return channel.send(embed);
}

const updateMatch = async (client) => {
  let channel = client.channels.cache.get("884107349793595523");
  let current_time = Date.now();
  let matchDoc = await TDMMatchModel.find({});
  let matchTimer = 'N/A';
  let timeUntilStart;
  let teamOneGTString = '';
  let teamTwoGTString = '';
  let teamOneScore;
  let teamTwoScore;
  if (matchDoc[0] === undefined || !matchDoc[0]) { // If there is no match
    teamOneGTString = 'N/A';
    teamTwoGTString = 'N/A';
    timeUntilStart = 'Waiting for players to queue';
    const embed = new discord.MessageEmbed()
      .setColor('#E02A6B')
      .setTitle('Cosmic TDM Pre-Match')
      .setURL('https://www.patreon.com/Cosmofficial')
      .setDescription('Preparing Next Match')
      .addFields({
        name: `Red Team:`,
        value: `${teamOneGTString}`
      }, {
        name: `Blue Team:`,
        value: `${teamTwoGTString}`
      }, {
        name: `Time Until Start:`,
        value: `${timeUntilStart}`
      }, )
      .setFooter('Cosmofficial by POPINxxCAPS');

      try {
        await channel.bulkDelete(2)
      } catch(err) {}
    return channel.send(embed);
  } else { // If there is a match
    if (matchDoc[0].teamOne.length === 0) {
      teamOneGTString = 'All Players Kicked'
    }
    if (matchDoc[0].teamTwo.length === 0) {
      teamTwoGTString = 'All Players Kicked'
    }
    await matchDoc[0].teamOne.forEach(player => {
      teamOneGTString += `${player.gamertag}\n`;
    })
    await matchDoc[0].teamTwo.forEach(player => {
      teamTwoGTString += `${player.gamertag}\n`;
    })
    matchTimer = ms(matchDoc[0].matchEndTime - current_time);
    timeUntilStart = ms((matchDoc[0].matchStartTime - current_time));
    teamOneScore = matchDoc[0].teamOneScore;
    teamTwoScore = matchDoc[0].teamTwoScore;

    if (matchDoc[0].matchStarted === false) {
      if (matchDoc[0].matchStartTime > current_time) {
        const embed = new discord.MessageEmbed()
          .setColor('#E02A6B')
          .setTitle('Cosmic TDM Pre-Match')
          .setURL('https://www.patreon.com/Cosmofficial')
          .setDescription('Preparing Next Match')
          .addFields({
            name: `Red Team:`,
            value: `${teamOneGTString}`
          }, {
            name: `Blue Team:`,
            value: `${teamTwoGTString}`
          }, {
            name: `Time Until Start:`,
            value: `${timeUntilStart}`
          }, )
          .setFooter('Cosmofficial by POPINxxCAPS');

          try {
            await channel.bulkDelete(2);
          } catch(err) {}
        return channel.send(embed);
      }
    } else {

      const embed = new discord.MessageEmbed()
        .setColor('#E02A6B')
        .setTitle('Cosmic TDM')
        .setURL('https://www.patreon.com/Cosmofficial')
        .setDescription('Showing current match information')
        .addFields({
            name: `Red Team:`,
            value: `${teamOneGTString}`
          }, {
            name: `Blue Team:`,
            value: `${teamTwoGTString}`
          }, {
            name: `Score:`,
            value: `Red Team: ${teamOneScore}\nBlue Team: ${teamTwoScore}`
          }, {
            name: `Match Timer:`,
            value: `${matchTimer}`
          },

        )
        .setFooter('Cosmofficial by POPINxxCAPS');

        try {
          await channel.bulkDelete(2)
        } catch(err) {}
      channel.send(embed);
    }
  }
}

async function updateErrors(client, string) {
  if (string === '') {
    string = 'No Errors!'
  }
  if (string === undefined || string === null) {
    string = 'Error in code'
  }
  let channel = client.channels.cache.get("884107382655954994")
  const embed = new discord.MessageEmbed()
    .setColor('#E02A6B')
    .setTitle('Cosmic TDM Errors')
    .setURL('https://www.patreon.com/Cosmofficial')
    .setDescription('Showing current match errors')
    .addFields({
      name: `All Errors:`,
      value: `${string}`
    }, )
    .setFooter('Cosmofficial by POPINxxCAPS');

    try {
      await channel.bulkDelete(2);
    } catch(err) {}
  return channel.send(embed);
}

async function playerStatus(client, teamOneString, teamTwoString) {
  let channel = client.channels.cache.get("884107300179161129")
  if (teamOneString === '') {
    teamOneString = 'N/A'
  }
  if (teamTwoString === '') {
    teamTwoString = 'N/A'
  }
  const embed = new discord.MessageEmbed()
    .setColor('#E02A6B')
    .setTitle('Cosmic TDM')
    .setURL('https://www.patreon.com/Cosmofficial')
    .setDescription('')
    .addFields({
      name: `Red Team:`,
      value: `${teamOneString}`
    }, {
      name: `Blue Team:`,
      value: `${teamTwoString}`
    }, )
    .setFooter('Cosmofficial by POPINxxCAPS');
    try {
      await channel.bulkDelete(2);
    } catch(err) {}
  return channel.send(embed);
}



module.exports = {
  updateQueue,
  updateMatch,
  updateErrors,
  playerStatus
}