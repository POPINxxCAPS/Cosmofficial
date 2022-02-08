const oauth = require("../oAuth")

function getGuilds(access_token) {
    oauth.getGuilds(access_token).then(console.log);
}

module.exports = getGuilds