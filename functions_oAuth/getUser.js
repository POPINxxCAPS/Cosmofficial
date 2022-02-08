const oauth = require("../oAuth")

async function getUser(access_token) {
    const user = await oauth.getUser(access_token);
    return user;
}

module.exports = getUser