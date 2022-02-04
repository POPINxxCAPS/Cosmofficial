const gridModel = require('../models/gridSchema');
const NPCNames = ['The Tribunal', 'Contractors', 'Gork and Mork', 'Space Pirates', 'Space Spiders', 'The Chairman', 'Miranda Survivors', 'VOID', 'The Great Tarantula', 'Cosmofficial', 'Clang Technologies CEO', 'Merciless Shipping CEO', 'Mystic Settlers CEO', 'Royal Drilling Consortium CEO', 'Secret Makers CEO', 'Secret Prospectors CEO', 'Specialized Merchants CEO', 'Star Inventors CEO', 'Star Minerals CEO', 'The First Heavy Industry CEO', 'The First Manufacturers CEO', 'United Industry CEO', 'Universal Excavators CEO', 'Universal Miners Guild CEO', 'Unyielding Excavators CEO'];


module.exports = async (guildID) => {
    let stations = 0
    let ships = 0
    let NPCs = 0
    if(guildID === undefined) return {
        stations,
        ships,
        NPCs
    };
    let gridDocs = await gridModel.find({guildID: guildID})

    if(gridDocs.length === 0) return {
        stations,
        ships,
        NPCs
    };

    for(let i = 0; i < gridDocs.length; i++) {
        if(NPCNames.includes(gridDocs[i].ownerDisplayName) === true) NPCs += 1;
        if(gridDocs[i].mass === 0) {
            stations += 1;
        } else {
            ships += 1;
        }
    }

    const count = {
        stations,
        ships,
        NPCs
    }
    return count;
}