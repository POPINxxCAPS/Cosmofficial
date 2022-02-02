const gridModel = require('../models/gridSchema');

module.exports = async (guildID, gridName, factionTagOptional) => {

    let data;
    if(factionTagOptional === undefined) {
        data = await gridModel.findOne({
            guildID: guildID,
            displayName: gridName
        })
    } else {
        data = await gridModel.findOne({
            guildID: guildID,
            displayName: gridName,
            factionTag: factionTagOptional
        })
    }
    
    if(data === null || data === undefined) return undefined;

    return data;
}