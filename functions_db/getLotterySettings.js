const settingsModel = require('../models/newSettingModel');

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

    return settings
}