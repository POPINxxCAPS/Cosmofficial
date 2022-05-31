const statusModel = require('../../models/statusSchema');
async function getGuildID(req, res, next) {
    let server;
    try {
        server = await statusModel.findOne({
            guildID: req.params.guildID
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
    res.server = server
    next()
}

module.exports = getGuildID;