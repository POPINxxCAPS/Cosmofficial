const xpModel = require('../models/xpSchema');


const levelEquation = async (xp) => {
    let levelOneRequirement = temp // Break time
}






module.exports = async (client, discord) => {
    let guildIDs = await client.guilds.cache.map(guild => guild.id);
    const mainGuild = client.guilds.cache.get("853247020567101440");
    // Interval to check for new discords
    setInterval(async () => {
        guildIDs = await client.guilds.cache.map(guild => guild.id);
    }, 300000)
    // Status Query
    setInterval(async () => {
        guildIDs.forEach(async guildID => {
            const guild = client.guilds.cache.get(guildID);
            if (guild === undefined || guild === null) return; // If bot is no longer in guild

            let patron;
            if (guild.owner === null) return; // Redundancy Check
            let guildOwner = mainGuild.members.cache.get(guild.owner.user.id);
            if (!guildOwner) return; // If guild owner is no longer in Cosmofficial discord

            if (guildOwner.roles.cache.has('883534965650882570') || guildOwner.roles.cache.has('883535930630213653')) {
                patron = true;
            }
            if (patron !== true) return;

            let xpDocs = await xpModel.find({})
            xpDocs.forEach(doc => {

            })
        }, 60000);
    });
}