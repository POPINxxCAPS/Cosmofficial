const gridModel = require('../models/gridSchema');

module.exports = async (guildID) => {
    const gridDocs = await gridModel.find({
        guildID: guildID
    });
    const sorted = gridDocs.sort((a, b) => ((a.PCU) > (b.PCU)) ? -1 : 1)
    return sorted
}