const DiscordOauth2 = require("discord-oauth2-api");
const oauth = new DiscordOauth2({
	clientId: "845784381025157131",
	clientSecret: process.env.oauthClientSecret || require('../env/env').oauthClientSecret,
	redirectUri: "http://localhost/login",
});

async function getUser(access_token) {
    let user = await oauth.getUser(access_token)
    return user;
}

module.exports = getUser