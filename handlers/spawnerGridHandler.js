const spawnerGridNames = ['Zone Chip Spawner', 'Ice Spawner', 'Iron Spawner', 'Silicon Spawner', 'Cobalt Spawner', 'Silver Spawner', 'Magnesium Spawner', 'Gold Spawner', 'Platinum Spawner', 'Uranium Spawner', 'Powerkit Spawner', 'Space Credit Converter']

module.exports = async (guildID, grid) => {
    if (spawnerGridNames.includes(gridData[i].DisplayName) === false || gridData[i].OwnerDisplayName !== "Space Pirates") return;

    // If it's a spawner grid, check to see if the grid should be powered off. (Deactivation timer failed due to crash or server restart)
    let spawnerDoc = await spawnerModel.findOne({
        guildID: guildID,
        gridName: gridData[i].DisplayName
    })
    if (spawnerDoc !== null) { // Redundancy Check
        if (spawnerDoc.expirationTime < current_time && gridData[i].IsPowered === true) {
            gridPowerOff(guildID, gridData[i].EntityId)
        }
    }
}