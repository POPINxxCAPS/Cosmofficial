module.exports = async (client, userID, guildID) => {
    let patron = false
    let mainGuild = await client.guilds.cache.get("853247020567101440");
    let guildOwner = mainGuild.members.cache.get(userID);
    if (!guildOwner) {
        return patron; // If not in Cosmofficial Discord
    }
    if (guildOwner.roles.cache.has('883534965650882570') || guildOwner.roles.cache.has('883535930630213653')) {
        patron = true;
    }
    return patron
}