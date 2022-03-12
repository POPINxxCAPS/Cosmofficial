const settingsModel = require('../models/newSettingModel');

module.exports = async (guildID) => {
    if(guildID === undefined) return;
    let settings = [];
    let commandsChannel = await settingsModel.findOne({
        guildID: guildID,
        category: 'channels',
        setting: 'commands'
    })
    if (commandsChannel === null) {
        commandsChannel = await settingsModel.create({
            guildID: guildID,
            displayName: 'Bot Command Channel',
            category: 'channels',
            description: 'If set, limits bot commands to only be allowed in that channel.\nAdministrators bypass this.\nAccepts a channel ID.',
            setting: 'commands',
            value: 'Not Set',
            valueType: 'channel'
        })
    }
    settings.push(commandsChannel);

    let chatRelayChannel = await settingsModel.findOne({
        guildID: guildID,
        category: 'channels',
        setting: 'chatrelay'
    })
    if (chatRelayChannel === null) {
        chatRelayChannel = await settingsModel.create({
            guildID: guildID,
            displayName: 'Chat Relay Channel',
            category: 'channels',
            description: 'If set, relays all in-game chats to a channel.\nAccepts a channel ID.\n*Note: Bypasses faction chat, but obscures all messages with GPS.*',
            setting: 'chatrelay',
            value: 'Not Set',
            valueType: 'channel'
        })
    }
    settings.push(chatRelayChannel);

    let hotzoneChannel = await settingsModel.findOne({
        guildID: guildID,
        category: 'channels',
        setting: 'hotzone'
    })
    if (hotzoneChannel === null) {
        hotzoneChannel = await settingsModel.create({
            guildID: guildID,
            displayName: 'Hotzone Channel',
            category: 'channels',
            description: 'Channel to be used by the Hotzone (KoTH) Minigame.\nAccepts a channel ID.',
            setting: 'hotzone',
            value: 'Not Set',
            valueType: 'channel'
        })
    }
    settings.push(hotzoneChannel);

    let dominationChannel = await settingsModel.findOne({
        guildID: guildID,
        category: 'channels',
        setting: 'domination'
    })
    if (dominationChannel === null) {
        dominationChannel = await settingsModel.create({
            guildID: guildID,
            displayName: 'Domination Channel',
            category: 'channels',
            description: 'Channel to be used by the Domination Minigame.\nAccepts a channel ID.',
            setting: 'domination',
            value: 'Not Set',
            valueType: 'channel'
        })
    }
    settings.push(dominationChannel);

    let lotteryChannel = await settingsModel.findOne({
        guildID: guildID,
        category: 'channels',
        setting: 'lottery'
    })
    if (hotzoneChannel === null) {
        chatRelayChannel = await settingsModel.create({
            guildID: guildID,
            displayName: 'Lottery Channel',
            category: 'channels',
            description: 'Channel to be used for lottery display.\nAccepts a channel ID.',
            setting: 'lottery',
            value: 'Not Set',
            valueType: 'channel'
        })
    }
    settings.push(lotteryChannel);

    return settings
}