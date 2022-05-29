const spawnerGridNames = ['Zone Chip Spawner', 'Ice Spawner', 'Iron Spawner', 'Silicon Spawner', 'Cobalt Spawner', 'Silver Spawner', 'Magnesium Spawner', 'Gold Spawner', 'Platinum Spawner', 'Uranium Spawner', 'Powerkit Spawner', 'Space Credit Converter', 'Common Loot Box', 'Ramshackle Loot Box', 'Apprentice Loot Box', 'Journeyman Loot Box', 'Mastercraft Loot Box', 'Ascendant Loot Box']
const gridDelete = require('../functions/execution/gridDelete');
module.exports = {
    name: 'cleanup',
    aliases: [],
    description: "Manually clean-up grids on server.\n- c!cleanup scan {parameter} {value}\n- c!cleanup delete {parameter} {value}.\n- c!cleanup parameters",
    permissions: ["SEND_MESSAGES"],
    category: "Administration",
    categoryAliases: ['administration', 'admin'],
    async execute(req) {
        
    }
}