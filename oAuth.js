const Client = require('disco-oauth');
let oauthClientSecret = process.env.oauthClientSecret || require('./env/env').oauthClientSecret
const client = new Client('845784381025157131', oauthClientSecret);

client.setScopes('identify', 'guilds');
let redirectURL;
if (process.env.oauthClientSecret === undefined) {
    redirectURL = "http://localhost:3000/login"
} else {
    redirectURL = "http://cosmofficial.herokuapp.com/login/"
}
client.setRedirect(redirectURL)

module.exports = client;