const playerEcoModel = require('../../models/playerEcoSchema');
const makeEcoSettingVar = require('../../functions_misc/makeEcoSettingVar');

module.exports = async (discord, client, member) => {
  const mainGuild = client.guilds.cache.get("853247020567101440");
  if (member.guild.owner === null) return;
  let guildOwner = mainGuild.members.cache.get(member.guild.owner.user.id);
  let patron;
  if (guildOwner !== undefined) {
    if (guildOwner.roles.cache.has('854236270129971200') || guildOwner.roles.cache.has('883535930630213653') || guildOwner.roles.cache.has('883534965650882570')) {
      patron = true;
    }
  }

  const ecoSettings = await makeEcoSettingVar(guildID);
  let startingBal = ecoSetting.startingBal;
  if(startingBal === "Not Set")
  startingBal = 0;


  let playerEco = await playerEcoModel.findOne({
    guildID: member.guild.id,
    userID: member.id
  })
  if (playerEco === null) {
    await playerEcoModel.create({
      guildID: member.guild.id,
      userID: member.id,
      currency: startingBal,
      vault: '0',
      statistics: []
    })
    playerEco = await playerEcoModel.findOne({
      guildID: member.guild.id,
      userID: member.id
    })
  }
  if (member.guild.id === '853247020567101440') {
    let welcomeRole = member.guild.roles.cache.find(role => role.id === '853250747440169000');
    member.roles.add(welcomeRole);
    member.guild.channels.cache.get('854202608449093653').send(`Welcome <@${member.user.id}>.`);
    console.log(`Role given to new member`);
  }

  if (member.guild.id === '799685703910686720') {
    let welcomeRole = member.guild.roles.cache.find(role => role.id === '799686409468117062');
    member.roles.add(welcomeRole);
    member.guild.channels.cache.get('799942788623237122').send(`Welcome to Cosmic PvPvAI <@${member.user.id}>.\n<#799954728149581844>\n<#799685786983071756>\n<#802837778643550218> c!help || c!verify`);
    console.log(`Role given to new member`);
  }

};