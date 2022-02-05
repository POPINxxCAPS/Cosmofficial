 function createInvite(client, guildID) {
 const guild = client.guilds.cache.get(guildID);
 let invite;
 const channel = guild.channels.cache
   .filter((ch) =>{ return ch.manageable && ch.type === 'text' })
   .first();
 channel.createInvite()
   .then(inv => { console.log(inv); invite = inv.code });
console.log(invite)
 return `https://discord.gg/${invite}`
}

module.exports = createInvite
