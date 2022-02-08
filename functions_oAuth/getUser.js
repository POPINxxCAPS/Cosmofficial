const oauth = require("../oAuth")

function getUser(access_token) {
    oauth.getUser(access_token).then(console.log);
}

module.exports = getUser