let playerEcoModel = require('../models/playerEcoSchema');
const getAllSettings = require('../functions_db/getAllSettings');
const makeEcoSettingVar = require('../functions_misc/makeEcoSettingVar');
module.exports = async (guildID, userID, settings) => {
    if(guildID === undefined || userID === undefined) return null;
    if(settings === undefined) {
        settings = await getAllSettings(guildID);
    }
    const ecoSettings = await makeEcoSettingVar(guildID, settings);

    const startingBal = ecoSettings.startingBal === 'Not Set' ? 0 : ecoSettings.startingBal;

    let playerEcoDoc = await playerEcoModel.findOne({
        guildID: guildID,
        userID: userID
    })
    if(playerEcoDoc === null) {
        playerEcoDoc = await playerEcoModel.create({
            guildID: guildID,
            userID: userID,
            currency: 0,
            vault: startingBal,
            statistics: []
          })
    }

    return playerEcoDoc;
}