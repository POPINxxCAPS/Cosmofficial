const gridModel = require('../models/gridSchema');

module.exports = async (guildID) => {
    const gridDocs = await gridModel.find({
        guildID: guildID
    });
    const sorted = await gridDocs.sort((a, b) => ((a.blocksCount) > (b.blocksCount)) ? -1 : 1)
    return sorted
}