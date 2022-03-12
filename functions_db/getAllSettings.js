

const getRemoteConfig = require('../functions_db/getRemoteConfig');
const getEconomySettings = require('../functions_db/getEconomySettings');
const getLotterySettings = require('../functions_db/getLotterySettings');
const getHotzoneSettings = require('../functions_db/getHotzoneSettings');
const getChannelSettings = require('../functions_db/getChannelSettings');
module.exports = async (guildID) => {
    let settings = [];
    const remoteConfig = await getRemoteConfig(guildID);
    const remoteConfigObj = {
        displayName: 'Remote API Setup',
        name: 'remote',
        description: `Edit your Remote API Connection information.`,
        aliases: ['r'],
        settings: remoteConfig,
        guildOwnerOnly: true
    }
    settings.push(remoteConfigObj)

    const channelSettings = await getChannelSettings(guildID);
    const channelSettingsObj = {
        displayName: 'Channel Settings',
        name: 'channels',
        description: 'Edit used discord channels. Also check out c!settings serverlog.',
        aliases: ['c'],
        settings: channelSettings,
    }
    settings.push(channelSettingsObj)

    const economySettings = await getEconomySettings(guildID);
    const economySettingsObj = {
        displayName: 'Economy Settings',
        name: 'economy',
        description: 'Edit various economy settings.',
        aliases: ['e'],
        settings: economySettings,
        patronReq: true,
    }
    settings.push(economySettingsObj)
    
    const lotterySettings = await getLotterySettings(guildID);
    const lotterySettingsObj = {
        displayName: 'Lottery Settings',
        name: 'lottery',
        description: 'Edit settings for the lottery system.',
        aliases: ['l'],
        settings: lotterySettings,
        patronReq: true
    }
    settings.push(lotterySettingsObj)

    const hotzoneSettings = await getHotzoneSettings(guildID);
    const hotzoneSettingsObj = {
        displayName: 'Hotzone (KoTH) Settings',
        name: 'hotzone',
        description: 'Edit configuration for the Hotzone mini-game.',
        aliases: ['h'],
        settings: hotzoneSettings,
        patronReq: true
    }
    settings.push(hotzoneSettingsObj)








    return settings
}