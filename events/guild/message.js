const cooldowns = new Map();
const getAllSettings = require('../../functions/database/getAllSettings');
const makeChannelsVar = require('../../functions/misc/makeChannelSettingVar');
const makeEcoSettingVar = require('../../functions/misc/makeEcoSettingVar');
const makeLotterySettingVar = require('../../functions/misc/makeLotterySettingVar');
const getPlayerEco = require('../../functions/database/getPlayerEco');
const errorEmbed = require('../../functions/discord/errorEmbed');

module.exports = async (discord, client, message) => {
  const prefix = 'c!'
  const guild = message.guild;
  if (guild === null) return; // Redundancy Crash Fix
  const mainGuild = client.guilds.cache.get("853247020567101440");
  const settings = await getAllSettings(guild.id);
  const channels = await makeChannelsVar(guild.id, settings);

  if (!message.content.startsWith(prefix) || message.author.bot) return;


  const args = message.content.slice(prefix.length).split(/ +/);
  const cmd = args.shift().toLowerCase();
  const command = await client.commands.get(cmd) || client.commands.find(a => a.aliases && a.aliases.includes(cmd));

  const commandChannel = channels.commands;

  if (commandChannel !== 'Not Set' && commandChannel !== undefined && commandChannel !== null) { // If a command channel is defined, compare
    if (message.member.hasPermission('ADMINISTRATOR')) {} else {
      const channelTest = client.channels.cache.get(args[1]); // Verify the channel exists still before cancelling.
      if (message.channel.id !== channels.commands && channelTest !== undefined && channelTest !== null) return;
    }
  }

  // Start permissions setup
  const validPermissions = [
    "CREATE_INSTANT_INVITE",
    "KICK_MEMBERS",
    "BAN_MEMBERS",
    "ADMINISTRATOR",
    "MANAGE_CHANNELS",
    "MANAGE_GUILD",
    "ADD_REACTIONS",
    "VIEW_AUDIT_LOG",
    "PRIORITY_SPEAKER",
    "STREAM",
    "VIEW_CHANNEL",
    "SEND_MESSAGES",
    "SEND_TTS_MESSAGES",
    "MANAGE_MESSAGES",
    "EMBED_LINKS",
    "ATTACH_FILES",
    "READ_MESSAGE_HISTORY",
    "MENTION_EVERYONE",
    "USE_EXTERNAL_EMOJIS",
    "VIEW_GUILD_INSIGHTS",
    "CONNECT",
    "SPEAK",
    "MUTE_MEMBERS",
    "DEAFEN_MEMBERS",
    "MOVE_MEMBERS",
    "USE_VAD",
    "CHANGE_NICKNAME",
    "MANAGE_NICKNAMES",
    "MANAGE_ROLES",
    "MANAGE_WEBHOOKS",
    "MANAGE_EMOJIS",
  ]

  if (command === undefined) {
    return message.channel.send('Not a valid command. Use c!help')
  }
  if (command.permissions.length) {
    let invalidPerms = []
    for (const perm of command.permissions) {
      if (!validPermissions.includes(perm)) {
        return console.log(`Invalid Permissions ${perm}`);
      }
      if (!message.member.hasPermission(perm)) {
        invalidPerms.push(perm);
      }
    }
    if (invalidPerms.length) {
      return message.reply(`You do not have sufficient permissions to execute this command. \nMissing Permissions: \`${invalidPerms}\``);
    }
  }
  // Finished Permissions Setup

  // Setting up all potentially needed request information
  try {
    let patron = false;
    const guildOwner = mainGuild.members.cache.get(message.guild.owner.user.id);
    if (!guildOwner || guildOwner === undefined || guildOwner === null) return errorEmbed(message.channel, 'The owner of this discord must be in the Cosmofficial discord to enable functionality of the bot.\nhttps://discord.gg/BfFc8cfp3n');
    if (guildOwner.roles.cache.has('883535930630213653') || guildOwner.roles.cache.has('883564396587147275')) {
      patron = true;
    }

    let playerEco = await getPlayerEco(guild.id, message.author.id, settings);
    const ecoSettings = await makeEcoSettingVar(guild.id, settings);
    const lotterySettings = await makeLotterySettingVar(guild.id, settings);

    // Making it more "restful"
    let req = {};
    req.message = message;
    req.args = args;
    req.cmd = cmd;
    req.client = client;
    req.discord = discord;
    req.mainGuild = mainGuild;
    req.guild = guild;
    req.playerEco = playerEco;
    req.patron = patron;
    req.settings = settings;
    req.channels = channels;
    req.ecoSettings = ecoSettings;
    req.lotterySettings = lotterySettings;
    command.execute(req); // Doing this will require recoding all commands, so disabling for now.
  } catch (err) {
    console.log(err);
    return errorEmbed(message.channel, 'There was an error trying to execute this command.')
  }
}