const playerModel = require('../models/playerSchema');
module.exports = (client) =>{
    const guildID = '799685703910686720';
    const guild = client.guilds.cache.get(guildID);
    setInterval(async () =>{
        const current_time = Date.now()
        const playerDocs = await playerModel.find({
            guildID: guildID
        })
        let activeCount = 0;
        for(let i = 0; i < playerDocs.length; i++) {
            if(current_time - playerDocs[i].lastLogout < 604800000) {
                activeCount += 1;
            }
        }




        const channel = guild.channels.cache.get('895742387631050803');
        channel.setName(`Active Players: ${activeCount}`)
    }, 900000);
}