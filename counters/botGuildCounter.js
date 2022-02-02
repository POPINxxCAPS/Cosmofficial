module.exports = async (client) =>{
    const guild = client.guilds.cache.get('853247020567101440');
    setInterval(() =>{
        const guildCount = client.guilds.cache.size;
        const channel = guild.channels.cache.get('894784199058415627');
        channel.setName(`Observing ${guildCount} Discords`);
    }, 900000);
}