module.exports = async = (client, userID) => {
    let patron = false
    let guild = await client.guilds.cache.get("853247020567101440");
    let guildOwner = mainGuild.members.cache.get(guild.owner.user.id);
    if (!guildOwner) return; // If guild owner is no longer in Cosmofficial discord

    if (guildOwner.roles.cache.has('883534965650882570') || guildOwner.roles.cache.has('883535930630213653')) {
        patron = true;
    }
    return patron
}