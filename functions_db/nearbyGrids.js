const gridModel = require('../models/gridSchema');
const allianceModel = require('../models/allianceSchema')
const ms = require('ms')

const NPCNames = ['The Tribunal', 'Contractors', 'Gork and Mork', 'Space Pirates', 'Space Spiders', 'The Chairman', 'Miranda Survivors', 'VOID', 'The Great Tarantula', 'Cosmofficial', 'Clang Technologies CEO', 'Merciless Shipping CEO', 'Mystic Settlers CEO', 'Royal Drilling Consortium CEO', 'Secret Makers CEO', 'Secret Prospectors CEO', 'Specialized Merchants CEO', 'Star Inventors CEO', 'Star Minerals CEO', 'The First Heavy Industry CEO', 'The First Manufacturers CEO', 'United Industry CEO', 'Universal Excavators CEO', 'Universal Miners Guild CEO', 'Unyielding Excavators CEO'];

module.exports = async (guildID, x, y, z, factionTag, distance, gridCache, allianceCache) => {
    const current_time = Date.now()
    if (distance === undefined) distance === 15000; // If no distance specified, use this default.
    let data = {
        npcs: [],
        friendlyGrids: [],
        enemyGrids: [],
    };
    if (factionTag === undefined) return data;

    // Check if grid docs need to be redownloaded, or if they were passed through.
    if(gridCache === undefined) {
        gridCache = await gridModel.find({
            guildID: guildID
        })
    }
    if(allianceCache === undefined) {
        allianceCache = await allianceModel.find({
            guildID: guildID
        })
    }
    const allianceDocs = allianceCache;

    let allys = []; // Get allies
    for (let a = 0; a < allianceDocs.length; a++) { // Need to check every alliance doc since there is no search method (I am aware of yet, at least)
        const alliance = allianceDocs[a];
        // Check if faction is in the alliance, if it is add tags to allys array. If not, continue.
        if (alliance.factionTags.includes({
                factionTag: factionTag
            }) === false) continue;
        for (let b = 0; b < alliance.factionTags.length; b++) {
            let tag = alliance.factionTags[b].factionTag;
            allys.push(tag)
        }
    }

    for (let i = 0; i < gridCache.length; i++) { // Sift through the cache, find grids that are close.
        let grid = gridCache[i];
        if(grid === undefined) continue;
        var dx = Math.round(parseFloat(grid.positionX)) - x;
        var dy = Math.round(parseFloat(grid.positionY)) - y;
        var dz = Math.round(parseFloat(grid.positionZ)) - z;

        let mathDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (mathDistance > distance) continue;

        // If the grid is nearby, check for their faction to know whether to label them an enemy or friend.
        if(NPCNames.includes(grid.ownerDisplayName === true)) {
            data.npcs.push({
                displayName: grid.displayName,
                entityID: grid.entityID,
                ownerDisplayName: grid.ownerDisplayName
            })
            continue; // If it's an NPC, skip the rest of the checks
        }
        
        if (grid.factionTag === '' || grid.factionTag === undefined || grid.factionTag === 'NoFac') { // If no faction
            data.enemyGrids.push({
                displayName: grid.displayName,
                entityID: grid.entityID,
                ownerDisplayName: grid.ownerDisplayName,
                factionTag: grid.factionTag
            }) // Just count it as an enemy. No way to tell.
            continue; // Skip the rest of the checks if no faction.
        }

        // If there is a faction, decide whether it's an enemy or not.
        if(allys.includes(grid.factionTag) === true) {
            data.friendlyGrids.push({
                displayName: grid.displayName,
                entityID: grid.entityID,
                ownerDisplayName: grid.ownerDisplayName,
                factionTag: grid.factionTag
            });
        } else {
            data.enemyGrids.push({
                displayName: grid.displayName,
                entityID: grid.entityID,
                ownerDisplayName: grid.ownerDisplayName,
                factionTag: grid.factionTag
            });
        }
    }

    //console.log(`Nearby grids took ${ms((Date.now() - current_time))}`);
    return data;
}