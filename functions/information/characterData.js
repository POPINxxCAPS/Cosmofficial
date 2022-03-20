const characterModel = require('../../models/characterSchema');

module.exports = async (guildID) => {

    let data = await characterModel.find({
        guildID: guildID
    })
    if(data.length === 0) return undefined;

    return data;
}