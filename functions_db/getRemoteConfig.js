const settingsModel = require('../models/newSettingModel');

module.exports = async (guildID) => {
    if(guildID === undefined) return;
    let config = [];
    let ip = await settingsModel.findOne({
        guildID: guildID,
        category: 'remote',
        setting: 'ip'
    })
    if (ip === null) {
        ip = await settingsModel.create({
            guildID: guildID,
            displayName: 'Remote API IP',
            description: 'Your Remote API IP Address.',
            category: 'remote',
            setting: 'ip',
            value: 'Not Set'
        })
    }
    config.push(ip);

    let port = await settingsModel.findOne({
        guildID: guildID,
        category: 'remote',
        setting: 'port'
    })
    if (port === null) {
        port = await settingsModel.create({
            guildID: guildID,
            displayName: 'Remote API Port',
            description: 'Your Remote API Port.',
            category: 'remote',
            setting: 'port',
            value: 'Not Set'
        })
    }
    config.push(port);

    let secret = await settingsModel.findOne({
        guildID: guildID,
        category: 'remote',
        setting: 'secret'
    })
    if (secret === null) {
        secret = await settingsModel.create({
            guildID: guildID,
            displayName: 'Remote API Secret',
            description: 'Your Remote API Secret.',
            category: 'remote',
            setting: 'secret',
            value: 'Not Set'
        })
    }
    config.push(secret);

    return config
}