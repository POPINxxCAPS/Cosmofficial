 function createInvite(client, guildID) {
 const guild = client.guilds.cache.get(guildID);
 let invite;
 const channel = guild.channels.cache
   .filter((ch) =>{ return ch.manageable && ch.type === 'text' })
   .first();
 channel.createInvite()
   .then(inv => { invite = inv.url });
 return `https://discord.gg/${invite}`
}

module.exports = createInvite
