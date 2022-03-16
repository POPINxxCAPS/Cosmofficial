const settingsModel = require('../models/settingSchema');

module.exports = async (guildID) => {
    if(guildID === undefined) return;
    let settings = [];
    let ticketPrice = await settingsModel.findOne({
        guildID: guildID,
        category: 'lottery',
        setting: 'ticketprice'
    })
    if (ticketPrice === null) {
        ticketPrice = await settingsModel.create({
            guildID: guildID,
            displayName: 'Ticket Price',
            category: 'lottery',
            description: 'Price for one lottery ticket.\n(0.01% Win chance per unique ticket)',
            setting: 'ticketprice',
            value: 'Not Set',
            valueType: 'number'
        })
    }
    settings.push(ticketPrice);

    let drawTime = await settingsModel.findOne({
        guildID: guildID,
        category: 'lottery',
        setting: 'drawtime'
    })
    if (drawTime === null) {
        drawTime = await settingsModel.create({
            guildID: guildID,
            displayName: 'Draw Time',
            category: 'lottery',
            description: 'Amount of time between each ticket drawing.',
            setting: 'drawtime',
            value: 'Not Set',
            valueType: 'time'
        })
    }
    settings.push(drawTime);

    let updateInterval = await settingsModel.findOne({
        guildID: guildID,
        category: 'lottery',
        setting: 'updateinterval'
    })
    if (updateInterval === null) {
        updateInterval = await settingsModel.create({
            guildID: guildID,
            displayName: 'Channel Update Interval',
            category: 'lottery',
            description: 'Time between updates to the lottery channel.',
            setting: 'updateinterval',
            value: 'Not Set',
            valueType: 'time'
        })
    }
    settings.push(updateInterval);

    let dailyInterest = await settingsModel.findOne({
        guildID: guildID,
        category: 'lottery',
        setting: 'dailyinterest'
    })
    if (dailyInterest === null) {
        dailyInterest = await settingsModel.create({
            guildID: guildID,
            displayName: 'Daily Interest',
            category: 'lottery',
            description: 'Interest percentage amount to add to the lottery pot every day.',
            setting: 'dailyinterest',
            value: 'Not Set',
            valueType: 'number'
        })
    }
    settings.push(dailyInterest);
    return settings
}