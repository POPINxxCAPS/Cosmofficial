const oauth = require("../oAuth")
const discord = require('discord.js');
const client = new discord.Client();
const token = process.env.token || require('../env/env').token

async function getGuilds(access_token) {
    await client.login(token)

    let mutualGuilds = [];
    let userGuilds = await oauth.getGuilds(access_token);
    client.guilds.cache.forEach(botGuild => {
        userGuilds.forEach((userGuild) => {
            console.log(userGuild._id)
            console.log(botGuild.id)
            if (userGuild._id === botGuild.id && userGuild !== undefined) {
                mutualGuilds.push(botGuild)
            }
        })
    })

    return mutualGuilds
}

module.exports = getGuilds