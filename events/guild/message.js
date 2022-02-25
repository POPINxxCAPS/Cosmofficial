const cooldowns = new Map();
const discordServerSettingsModel = require('../../models/discordServerSettngsSchema')
const playerEcoModel = require('../../models/playerEcoSchema');
const economySettingModel = require('../../models/economySettingSchema');

module.exports = async (discord, client, message) => {
  const prefix = 'c!'
  const guild = message.guild;
  const mainGuild = client.guilds.cache.get("853247020567101440");
  
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  let discordSettings = await discordServerSettingsModel.findOne({
    guildID: message.guild.id
  })
  if (discordSettings === null) {
    await discordServerSettingsModel.create({
      guildID: message.guild.id,
      serverLogChannel: 'None',
      hotzoneChannel: 'None',
      chatRelayChannel: 'None',
      botCommandChannel: 'None'
    })
    discordSettings = await discordServerSettingsModel.findOne({
      guildID: message.guild.id
    })
  }

  if (discordSettings.botCommandChannel !== 'None') {
    if (message.member.hasPermission('ADMINISTRATOR')) {} else {
      if (message.channel.id !== discordSettings.botCommandChannel) return;
    }
  }
  const args = message.content.slice(prefix.length).split(/ +/);
  const cmd = args.shift().toLowerCase();
  const command = await client.commands.get(cmd) || client.commands.find(a => a.aliases && a.aliases.includes(cmd));

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
  // Finish Permissions Setup
  try {
    let economyPackage;
    let guildOwner = mainGuild.members.cache.get(message.guild.owner.user.id);
  
    if (guildOwner.roles.cache.has('854236270129971200') || guildOwner.roles.cache.has('883535930630213653') || guildOwner.roles.cache.has('883534965650882570')) {
      economyPackage = true;
    }
  
  
    if (economyPackage === true) {
      let ecoSettings = await economySettingModel.findOne({
        guildID: guild.id
      })
      if (ecoSettings !== null) {
        ecoSettings.settings.forEach(setting => {
          if (setting.name === 'StartingBalance') {
            defaultStartingBalance = Number(setting.value);
          }
        })
      }
    }
  } catch(err) {
  }
  
  let defaultStartingBalance = 0;

  try {
    let playerEco = await playerEcoModel.findOne({
      guildID: guild.id,
      userID: message.author.id
    })
    if (playerEco === null) {
      await playerEcoModel.create({
        guildID: guild.id,
        userID: message.author.id,
        currency: defaultStartingBalance,
        vault: '0',
        statistics: []
      })
      playerEco = await playerEcoModel.findOne({
        guildID: guild.id,
        userID: message.author.id
      })
    }

    // Making it more "restful"
    let res = {}
    res.message = message;
    res.args = args;
    res.cmd = cmd;
    res.client = client;
    res.discord = discord;
    res.mainGuild = mainGuild;
    res.guild = guild;
    res.playerEco = playerEco;
    // command.execute(res); // Doing this will require recoding all commands, so disabling for now.
    command.execute(message, args, cmd, client, discord, mainGuild, guild, playerEco);
  } catch (err) {
    message.reply("There was an error trying to execute this command!");
    console.log(err);
  }
}