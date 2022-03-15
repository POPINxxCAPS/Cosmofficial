const getAllSettings = require("../functions_db/getAllSettings");

module.exports = async (guildID, settings) => {
    if(settings === undefined) {
        settings = await getAllSettings(guildID);
    }
    const lottery = settings.find(set => set.name === 'lottery')
    let lotterySettings = {};
    try { // .find() Causes crashes, so I need to do it this way.
        lotterySettings.ticketPrice = lottery.settings.find(set => set.setting === 'ticketprice').value;
        lotterySettings.dailyInterest = lottery.settings.find(set => set.setting === 'dailyinterest').value;
        lotterySettings.drawTime = lottery.settings.find(set => set.setting === 'drawtime').value;
        lotterySettings.updateInterval = lottery.settings.find(set => set.setting === 'updateinterval').value;
    } catch (err) {
        console.log(`There was an error making the lotterySetting var for guildID ${guildID}.`)
        console.log(err)
        return null;
    }
    return lotterySettings;
}