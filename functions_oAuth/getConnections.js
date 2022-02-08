const oauth = require("../oAuth")

function getConnections(access_token) {
    oauth.getConnections(access_token).then(console.log);
}

module.exports = getConnections