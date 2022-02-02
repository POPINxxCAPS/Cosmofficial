const gridModel = require('../models/gridSchema');

module.exports = async (guildID) => {

    let data = await gridModel.find({
        guildID: guildID
    })
    if(data.length === 0) return undefined;

    return data;
}