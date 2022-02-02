module.exports = async (client) =>{
    const guild = client.guilds.cache.get('799685703910686720');
    setInterval(() =>{
        const memberCount = guild.memberCount - 5;
        const channel = guild.channels.cache.get('865494326976970782');
        channel.setName(`${memberCount.toLocaleString()} Members`);
        console.log('Updating Member Count');
    }, 900000);
}