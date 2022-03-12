const getAllSettings = require("../functions_db/getAllSettings");

module.exports = async (guildID, settings) => {
    if(settings === undefined) {
        settings = await getAllSettings(guildID);
    }
    const economy = settings.find(set => set.name === 'economy')
    let ecoSettings = {};
    try { // .find() Causes crashes, so I need to do it this way.
        ecoSettings.currencyName = economy.settings.find(set => set.setting === 'currencyname').value;
        ecoSettings.startingBal = economy.settings.find(set => set.setting === 'startingbal').value;
        ecoSettings.onlineReward = economy.settings.find(set => set.setting === 'onlinereward').value;
        ecoSettings.timelyReward = economy.settings.find(set => set.setting === 'timelyreward').value;
    } catch (err) {
        console.log(`There was an error making the ecoSetting var for guildID ${guildID}.`)
        return null;
    }
    return ecoSettings;
}