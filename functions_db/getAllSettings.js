

const getRemoteConfig = require('../functions_db/getRemoteConfig');
const getEconomySettings = require('../functions_db/getEconomySettings');
const getLotterySettings = require('../functions_db/getLotterySettings');
const getHotzoneSettings = require('../functions_db/getHotzoneSettings');
const getChannelSettings = require('../functions_db/getChannelSettings');
const getHooverSettings = require('../functions_db/getHooverSettings');
module.exports = async (guildID) => {
    let settings = [];
    const remoteConfig = await getRemoteConfig(guildID);
    const remoteConfigObj = {
        displayName: 'Remote API Setup',
        name: 'remote',
        description: `Edit your Remote API Connection information.`,
        aliases: ['r'],
        settings: remoteConfig,
        guildOwnerOnly: true,
        patronReq: false,
    }
    settings.push(remoteConfigObj)

    const channelSettings = await getChannelSettings(guildID);
    const channelSettingsObj = {
        displayName: 'Channel Settings',
        name: 'channels',
        description: 'Edit used discord channels. Also check out c!settings serverlog.',
        aliases: ['c'],
        settings: channelSettings,
        patronReq: false,
    }
    settings.push(channelSettingsObj)

    const hooverSettings = await getHooverSettings(guildID);
    const hooverSettingsObj = {
        displayName: 'Hoover Settings',
        name: 'hoover',
        description: 'Edit the hoover, great for performance!',
        aliases: ['hoo'],
        settings: hooverSettings,
        patronReq: false,
    }
    settings.push(hooverSettingsObj)

    const economySettings = await getEconomySettings(guildID);
    const economySettingsObj = {
        displayName: 'Economy Settings',
        name: 'economy',
        description: 'Edit various economy settings.',
        aliases: ['e'],
        settings: economySettings,
        patronReq: false,
    }
    settings.push(economySettingsObj)
    
    const lotterySettings = await getLotterySettings(guildID);
    const lotterySettingsObj = {
        displayName: 'Lottery Settings',
        name: 'lottery',
        description: 'Edit settings for the lottery system.',
        aliases: ['l'],
        settings: lotterySettings,
        patronReq: false
    }
    settings.push(lotterySettingsObj)

    const hotzoneSettings = await getHotzoneSettings(guildID);
    const hotzoneSettingsObj = {
        displayName: 'Hotzone (KoTH) Settings',
        name: 'hotzone',
        description: 'Edit configuration for the Hotzone mini-game.',
        aliases: ['hot'],
        settings: hotzoneSettings,
        patronReq: true
    }
    settings.push(hotzoneSettingsObj)








    return settings
}