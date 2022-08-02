const playerModel = require('../models/playerSchema');
const errorEmbed = require('../functions/discord/errorEmbed');
const banModel = require('../models/banSchema');

const validArgs = ['ban',  'unban'];
module.exports = {
  name: 'player',
  aliases: ['player'],
  description: "List online players and information about them.",
  permissions: ["SEND_MESSAGES"],
  category: "General",
    categoryAliases: ['general'],
  async execute(req) {
    const message = req.message;
    const discord = req.discord;
    const mainGuild = req.mainGuild;
    const args = req.args;
    const guild = req.guild;
    const current_time = Date.now();
    
    let validArgString = '';
    for(const valid of validArgs) {
        validArgString += `${valid}\n`;
    }
    if(validArgs.includes(args[0] === false)) return errorEmbed(message.channel, `Invalid Arguments. Valid:\n${validArgString}`);

    let playerName = "";
    for(const arg of args) {
        const index = args.indexOf(arg);
        if(index === 0) continue;
        if(playerName === '') { 
            playerName += `${arg}`;
            continue;
        }
        playerName = playerName + ' ' + `${arg}`;
    }
    if(args[0] === 'ban') {
        const playerDoc = await playerModel.findOne({
            guildID: guild.id,
            displayName: playerName
        })
        if(playerDoc === undefined || playerDoc === null) return errorEmbed(message.channel, "Username was not found. Check your spelling and capitilaztion then try again.");
        await banModel.create({
            guildID: guild.id,
            steamID: playerDoc.steamID
        });
        const embed =  new discord.MessageEmbed()
        .setColor('#E02A6B')
        .setTitle(`The Ban Invoker`)
        .setURL('https://cosmofficial.herokuapp.com/')
        .setDescription(`${playerName} banned successfully. They will now be kicked immediatedly when detected on-server.\nThis does not do anything for discord, only in-game.\nThey were banned by Steam ID: ${playerDoc.steamID}, so it will persist through username changes.\nUnban them with c!player unban`)
        .setFooter('Cosmofficial by POPINxxCAPS');
        return message.channel.send(embed);
    }

    if(args[0] === 'unban') {
        const playerDoc = await playerModel.findOne({
            guildID: guild.id,
            displayName: playerName
        })
        if(playerDoc === undefined || playerDoc === null) return errorEmbed(message.channel, "Username was not found. Check your spelling and capitilaztion then try again.");
        const banDoc = await banModel.findOne({
            guildID: guild.id,
            steamID: playerDoc.steamID
        });
        if(banDoc === undefined || banDoc === null) return errorEmbed(message.channel, "Player is not banned!");
        banDoc.remove();
        const embed =  new discord.MessageEmbed()
        .setColor('#E02A6B')
        .setTitle(`The Ban Revoker`)
        .setURL('https://cosmofficial.herokuapp.com/')
        .setDescription(`${playerName} ban lifted succussfully. They will no longer be kicked when detected on-server.`)
        .setFooter('Cosmofficial by POPINxxCAPS');
        return message.channel.send(embed);
    }
  }
}