const oauth = require("../oAuth")

async function getGuilds(access_token) {
    const guilds = await oauth.getGuilds(access_token).then(console.log);
    return guilds
}

module.exports = getGuilds