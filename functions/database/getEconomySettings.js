const settingsModel = require('../../models/settingSchema');

module.exports = async (guildID) => {
    if(guildID === undefined) return;
    let settings = [];
    let currencyName = await settingsModel.findOne({
        guildID: guildID,
        category: 'economy',
        setting: 'currencyname'
    })
    if (currencyName === null) {
        currencyName = await settingsModel.create({
            guildID: guildID,
            displayName: 'Currency Name',
            category: 'economy',
            description: 'Sets your currency name (EX: Space-Credits)\n*Use hyphen or underscore for multiple word names.*',
            setting: 'currencyname',
            value: 'Not Set',
            valueType: 'string'
        })
    }
    settings.push(currencyName);


    let startingBal = await settingsModel.findOne({
        guildID: guildID,
        category: 'economy',
        setting: 'startingbal'
    })
    if (startingBal === null) {
        startingBal = await settingsModel.create({
            guildID: guildID,
            displayName: 'Starting Balance',
            category: 'economy',
            description: 'Starting balance for new players.',
            setting: 'startingbal',
            value: 'Not Set',
            valueType: 'number'
        })
    }
    settings.push(startingBal);


    let onlineReward = await settingsModel.findOne({
        guildID: guildID,
        category: 'economy',
        setting: 'onlinereward'
    })
    if (onlineReward === null) {
        onlineReward = await settingsModel.create({
            guildID: guildID,
            displayName: 'Online Player Reward',
            category: 'economy',
            description: 'Amount (per-second) to grant online+verified players.',
            setting: 'onlinereward',
            value: 'Not Set',
            valueType: 'number'
        })
    }
    settings.push(onlineReward);


    let timelyReward = await settingsModel.findOne({
        guildID: guildID,
        category: 'economy',
        setting: 'timelyreward'
    })
    if (timelyReward === null) {
        timelyReward = await settingsModel.create({
            guildID: guildID,
            displayName: 'Timely Reward',
            category: 'economy',
            description: 'Amount to reward for c!time (1hr cooldown)',
            setting: 'timelyreward',
            value: 'Not Set',
            valueType: 'number'
        })
    }
    settings.push(timelyReward);

    return settings
}