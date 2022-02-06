async function createInvite(client, guildID) {
 const guild = client.guilds.cache.get(guildID);
 let invite;
 const channel = guild.channels.cache
   .filter((ch) =>{ return ch.manageable && ch.type === 'text' })
   .first();
 await channel.createInvite({
  maxAge: 600,
  maxUses: 5
})
   .then(inv => { invite = inv.code });
 return `https://discord.gg/${invite}`
}

module.exports = createInvite
