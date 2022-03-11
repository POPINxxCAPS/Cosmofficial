

const getRemoteConfig = require('../functions_db/getRemoteConfig');
const getEconomySettings = require('../functions_db/getEconomySettings');
const getLotterySettings = require('../functions_db/getLotterySettings');
const getHotzoneSettings = require('../functions_db/getHotzoneSettings');
module.exports = async (guildID) => {
    let settings = [];
    const remoteConfig = await getRemoteConfig(guildID);
    const remoteConfigObj = {
        name: 'remote',
        aliases: [],
        settings: remoteConfig
    }
    settings.push(remoteConfigObj)

    const economySettings = await getEconomySettings(guildID);
    const economySettingsObj = {
        name: 'economy',
        aliases: [],
        settings: economySettings
    }
    settings.push(economySettingsObj)
    
    const lotterySettings = await getLotterySettings(guildID);
    const lotterySettingsObj = {
        name: 'lottery',
        aliases: [],
        settings: lotterySettings
    }
    settings.push(lotterySettingsObj)

    const hotzoneSettings = await getHotzoneSettings(guildID);
    const hotzoneSettingsObj = {
        name: 'hotzone',
        aliases: [],
        settings: hotzoneSettings
    }
    settings.push(hotzoneSettingsObj)








    return settings
}