// Moving all of these to one function so that there is less intervals running all over the place
const playerModel = require('../../models/playerSchema');

const statusModel = require('../../models/statusSchema');
module.exports = async (client) => {
    const current_time = Date.now();

    // Bot Activity Status
    const settingDocs = await statusModel.find({});
    let servers = 0;
    settingDocs.forEach(doc => {
        if (doc.serverOnline === true) {
            servers += 1;
        }
    })
    client.user.setActivity(`${servers} Servers`, ({
        type: "WATCHING"
    }))


    // Cosmic Only Area, will make all of these available for other discords in the future... Recode and performance first.
    // Time Played Channel Ticker
    let guild = client.guilds.cache.get('799685703910686720');
    let channel = guild.channels.cache.get('920164656138567741');
    let time = 0;
    let activeCount = 0;
    const playerDocs = await playerModel.find({
        guildID: guild.id
    })
    if (playerDocs.length === 0) return;

    for (let i = 0; i < playerDocs.length; i++) {
        let playerTime = 0;
        for (let a = 0; a < playerDocs[i].loginHistory.length; a++) {
            playerTime += parseInt(playerDocs[i].loginHistory[a].logout) - parseInt(playerDocs[i].loginHistory[a].login)
        }
        time += playerTime
        if (current_time - playerDocs[i].lastLogout < 604800000) {
            activeCount += 1;
        }
    }

    let daysPlayed = Math.round(((time / (3600000 * 24)) * 100)) / 100;
    if(channel === undefined) return;
    channel.setName(`Time Played: ${daysPlayed} days`)
    channel = guild.channels.cache.get('895742387631050803');
    channel.setName(`Active Players: ${activeCount}`)

    const memberCount = guild.memberCount - 5;
    channel = guild.channels.cache.get('865494326976970782');
    channel.setName(`${memberCount.toLocaleString()} Members`);

    // Bot Discord Stuff
    guild = client.guilds.cache.get('853247020567101440');
    const guildCount = client.guilds.cache.size;
    channel = guild.channels.cache.get('894784199058415627');
    channel.setName(`Observing ${guildCount} Discords`);
}