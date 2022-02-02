const playerModel = require('../models/playerSchema');


module.exports = (client, discord) => {
    const guild = client.guilds.cache.get('799685703910686720');
    const channel = guild.channels.cache.get('920164656138567741');
    setInterval(async () => {
        let time = 0;
        let playerDocs = await playerModel.find({
            guildID: guild.id
        })
        if(playerDocs.length === 0) return;

        for(let i = 0; i < playerDocs.length; i++) {
            let playerTime = 0;
            for(let a = 0; a < playerDocs[i].loginHistory.length; a++) {
                playerTime += parseInt(playerDocs[i].loginHistory[a].logout) - parseInt(playerDocs[i].loginHistory[a].login)
            }
            time += playerTime
        }

        let daysPlayed = Math.round(((time / (3600000 * 24)) * 100)) / 100;
        channel.setName(`Time Played: ${daysPlayed} days`)
    }, 300000)
}