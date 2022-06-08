const verificationModel = require('../../models/verificationSchema');
const playerModel = require('../../models/playerSchema');
const playerEcoModel = require('../../models/playerEcoSchema');

module.exports = async (guildID, factionTag, rewardAmount) => {
    if(factionTag === undefined) return false;
    const playerDocs = await playerModel.find({
        guildID: guildID,
        factionTag: factionTag
    })

    let playersToReward = [];
    for(const doc of playerDocs) {
        const verDoc = await verificationModel.findOne({
            username: doc.displayName
        })
        if(verDoc === null) continue;
        playersToReward.push(verDoc.userID);
    }

    for(const userID of playersToReward) {
        let playerEcoDoc = await playerEcoModel.findOne({
            guildID: guildID,
            userID: userID
        })
        playerEcoDoc.currency = parseInt(playerEcoDoc.currency) + Math.round((rewardAmount / playersToReward.length));
        playerEcoDoc.save();
    }

    return true;
}