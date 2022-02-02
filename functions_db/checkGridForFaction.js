const playersModel = require('../models/playerSchema');
async function serverGrid(grid, guildID) {
    let noFac = 'NoF'
    if(grid.OwnerDisplayName) {
        if((grid.OwnerDisplayName === '') || (!grid.OwnerDisplayName)) {
            return noFac;
        } else {
            let gridOwnerData = await playersModel.findOne({displayName: grid.OwnerDisplayName, guildID: guildID});
            if((!gridOwnerData) || (gridOwnerData === null)) {
                return noFac
            }
            let ownerFactionTag = gridOwnerData.factionTag;
            if(gridOwnerData.factionTag === '') return noFac // Check for faction tag after verifyingh gridOwnerData is not null
            return ownerFactionTag;
        }
    }
}

async function dbGrid(grid, guildID) {
    let noFac = 'NoF'
    if(grid.ownerDisplayName) {
        if((grid.ownerDisplayName === '') || (!grid.ownerDisplayName)) {
            return noFac;
        } else {
            let gridOwnerData = await playersModel.findOne({displayName: grid.ownerDisplayName, guildID: guildID})
            if((!gridOwnerData) || (gridOwnerData === null)) {
                return noFac
            }
            if(gridOwnerData.factionTag === '') return noFac // Check for faction tag after verifyingh gridOwnerData is not null
            let ownerFactionTag = gridOwnerData.factionTag;
            return ownerFactionTag;
        }
    }
}

module.exports = {
    serverGrid,
    dbGrid
}