const settingsModel = require('../../models/settingSchema');


module.exports = async (guildID) => {
    if (guildID === undefined) return;
    let settings = [];
    let enabled = await settingsModel.findOne({
        guildID: guildID,
        category: 'hotzone',
        setting: 'enabled'
    })
    if (enabled === null) {
        enabled = await settingsModel.create({
            guildID: guildID,
            displayName: 'Enabled',
            category: 'hotzone',
            description: 'Is hotzone enabled, true/false.',
            setting: 'enabled',
            value: 'false',
            valueType: 'boolean'
        })
    }
    settings.push(enabled);


    let interval = await settingsModel.findOne({
        guildID: guildID,
        category: 'hotzone',
        setting: 'interval'
    })
    if (interval === null) {
        interval = await settingsModel.create({
            guildID: guildID,
            displayName: 'Hotzone Interval',
            category: 'hotzone',
            description: 'How long between each zone. (4d, 2h, etc.)',
            setting: 'interval',
            value: 'Not Set',
            valueType: 'time'
        })
    }
    settings.push(interval);


    let timer = await settingsModel.findOne({
        guildID: guildID,
        category: 'hotzone',
        setting: 'timer'
    })
    if (timer === null) {
        timer = await settingsModel.create({
            guildID: guildID,
            displayName: 'Hotzone Timer',
            category: 'hotzone',
            description: 'How long each zone lasts. (4d, 2h, etc.)',
            setting: 'timer',
            value: 'Not Set',
            valueType: 'time'
        })
    }
    settings.push(timer);


    let reward = await settingsModel.findOne({
        guildID: guildID,
        category: 'hotzone',
        setting: 'reward'
    })
    if (reward === null) {
        reward = await settingsModel.create({
            guildID: guildID,
            displayName: 'Hotzone Reward',
            category: 'hotzone',
            description: 'Amount to reward (per-sec).',
            setting: 'reward',
            value: 'Not Set',
            valueType: 'number'
        })
    }
    settings.push(reward);


    let bonus = await settingsModel.findOne({
        guildID: guildID,
        category: 'hotzone',
        setting: 'bonus'
    })
    if (bonus === null) {
        bonus = await settingsModel.create({
            guildID: guildID,
            displayName: 'Hotzone Bonus',
            category: 'hotzone',
            description: 'Amount to reward as a bonus at the end of a zone timer.',
            setting: 'bonus',
            value: 'Not Set',
            valueType: 'number'
        })
    }
    settings.push(bonus);


    let radius = await settingsModel.findOne({
        guildID: guildID,
        category: 'hotzone',
        setting: 'radius'
    })
    if (radius === null) {
        radius = await settingsModel.create({
            guildID: guildID,
            displayName: 'Hotzone Radius',
            category: 'hotzone',
            description: 'Radius from the GPS players/grids should be detected. (Meters)',
            setting: 'radius',
            value: 'Not Set',
            valueType: 'number'
        })
    }
    settings.push(radius);

    let range = await settingsModel.findOne({
        guildID: guildID,
        category: 'hotzone',
        setting: 'range'
    })
    if (range === null) {
        range = await settingsModel.create({
            guildID: guildID,
            displayName: 'Hotzone Range',
            category: 'hotzone',
            description: 'How far from x0 y0 z0 the Hotzone can spawn. (Meters)',
            setting: 'range',
            value: 'Not Set',
            valueType: 'number'
        })
    }
    settings.push(range);

    return settings
}