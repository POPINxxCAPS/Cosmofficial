const timerModel = require('../models/timerSchema');

module.exports = async (req, res) => {
    const current_time = Date.now()
    const expirationTime = (req.expirationInSeconds * 1000) + current_time;
    let timerDoc = await timerModel.findOne({
        guildID: req.guildID,
        name: req.name,
    })
    if(timerDoc === null) {
        timerDoc = await timerModel.create({
            guildID: req.guildID,
            name: req.name,
            expirationTime: expirationTime
        })
    }

    if(timerDoc === null) return 1// Redundancy check
    let timeRemaining = parseInt(timerDoc.expirationTime) - current_time
    if(timeRemaining <= 0) {
        return false;
    } else return true;
}