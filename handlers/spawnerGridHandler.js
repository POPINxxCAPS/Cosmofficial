const spawnerGridNames = ['Zone Chip Spawner', 'Ice Spawner', 'Iron Spawner', 'Silicon Spawner', 'Cobalt Spawner', 'Silver Spawner', 'Magnesium Spawner', 'Gold Spawner', 'Platinum Spawner', 'Uranium Spawner', 'Powerkit Spawner', 'Space Credit Converter']
const spawnerModel = require('../models/spawnerSchema');

module.exports = async (guildID, grid) => {
    const current_time = Date.now();
    if (spawnerGridNames.includes(grid.DisplayName) === false || grid.OwnerDisplayName !== "Space Pirates") return;

    // If it's a spawner grid, check to see if the grid should be powered off. (Deactivation timer failed due to crash or server restart)
    let spawnerDoc = await spawnerModel.findOne({
        guildID: guildID,
        gridName: grid.DisplayName
    })
    if (spawnerDoc !== null) { // Redundancy Check
        if (spawnerDoc.expirationTime < current_time && grid.IsPowered === true) {
            gridPowerOff(guildID, grid.EntityId)
        }
    }
    return;
}