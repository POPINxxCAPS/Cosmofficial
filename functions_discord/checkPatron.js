module.exports = async (userID, client) => {
    if(client === undefined) throw 'Client is undefined';
    const mainGuild = client.guilds.cache.get("853247020567101440");
    let guildOwner = mainGuild.members.cache.get(userID);
    let patron = false;
    if (!guildOwner || guildOwner === null || guildOwner === undefined) return patron;
    if (guildOwner.roles.cache.has('883535930630213653') || guildOwner.roles.cache.has('883564396587147275')) {
        patron = true;
    }
    return patron;
}