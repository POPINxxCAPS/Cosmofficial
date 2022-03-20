const gridModel = require('../../models/gridSchema');

module.exports = async (guildID, username) => {
    let gridDocs;
    if(username === undefined) {
        gridDocs = await gridModel.find({
            guildID: guildID
        });
    } else {
        gridDocs = await gridModel.find({
            guildID: guildID,
            ownerDisplayName: username
        });
    }
    
    const sorted = await gridDocs.sort((a, b) => ((a.blocksCount) > (b.blocksCount)) ? -1 : 1)
    return sorted
}