const spawnerGridNames = ['Zone Chip Spawner', 'Ice Spawner', 'Iron Spawner', 'Silicon Spawner', 'Cobalt Spawner', 'Silver Spawner', 'Magnesium Spawner', 'Gold Spawner', 'Platinum Spawner', 'Uranium Spawner', 'Powerkit Spawner', 'Space Credit Converter', 'Common Loot Box', 'Ramshackle Loot Box', 'Apprentice Loot Box', 'Journeyman Loot Box', 'Mastercraft Loot Box', 'Ascendant Loot Box']
const spawnerModel = require('../models/spawnerSchema');

module.exports = async (guildID, grid) => {
    const current_time = Date.now();
    if (spawnerGridNames.includes(grid.DisplayName) === false || grid.OwnerDisplayName !== "Space Pirates") return;
    // If it's a spawner grid, check to see if the grid should be powered off. (Deactivation timer failed due to crash or server restart)
    const spawnerDoc = await spawnerModel.findOne({
        guildID: guildID,
        gridName: grid.DisplayName
    })
    if (spawnerDoc !== null) { // Redundancy Check
        if (spawnerDoc.expirationTime < current_time && grid.IsPowered === true) {
            gridPowerOff(guildID, grid.EntityId)
        }
    } else {
        await spawnerModel.create({
            guildID: guildID,
            gridName: grid.DisplayName,
            expirationTime: current_time
        })
        gridPowerOff(guildID, grid.EntityId)
    }
    return;
}