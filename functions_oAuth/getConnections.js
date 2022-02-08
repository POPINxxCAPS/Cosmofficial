const oauth = require("../oAuth")

function getConnections(access_token) {
    let connections = oauth.getConnections(access_token).then(console.log);
    return connections;
}

module.exports = getConnections