const playerModel = require('../models/playerSchema');
const characterModel = require('../models/characterSchema');
const allianceModel = require('../models/allianceSchema')
const ms = require('ms')

module.exports = async (guildID, x, y, z, factionTag, distance, allianceCache, characterDocsCache) => {
    const current_time = Date.now();
    if (distance === undefined) distance === 15000; // If no distance specified, use this default.
    let data = {
        enemyCharacters: [],
        friendlyCharacters: []
    };
    if (factionTag === undefined) return data;

    if (characterDocsCache === undefined) {
        characterDocsCache = await characterModel.find({
            guildID: guildID
        })
    }
    const charDocs = characterDocsCache;
    if (charDocs.length === 0 || charDocs === null || charDocs === undefined) return data;

    for (let i = 0; i < charDocs.length; i++) {
        let char = charDocs[i];
        var dx = Math.round(parseFloat(char.x)) - x;
        var dy = Math.round(parseFloat(char.y)) - y;
        var dz = Math.round(parseFloat(char.z)) - z;

        let mathDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (mathDistance > distance) continue;
        // If the character is nearby, check for their faction to know whether to label them an enemy or friend.
        const playerDoc = await playerModel.findOne({
            guildID: guildID,
            displayName: char.name
        })
        if (playerDoc === null) continue; // Redundancy check
        char.factionTag === playerDoc.factionTag
        if (playerDoc.factionTag === '' || playerDoc.factionTag === undefined || playerDoc.factionTag === 'NoFac') { // If no faction
            data.enemyCharacters.push(char) // Just count it as an enemy. No way to tell.
            continue;
        }


        // If there is a faction, find allied faction tags
        if (allianceCache === undefined) {
            allianceCache = await allianceModel.find({
                guildID: guildID
            })
        }
        const allianceDocs = allianceCache;

        let allys = [];
        for (let a = 0; a < allianceDocs.length; a++) { // Need to check every alliance doc since there is no search function
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

        // After getting allied tags, decide whether it's an enemy or not.
        if (allys.includes(char.factionTag) === true) {
            data.friendlyCharacters.push(char);
        } else {
            data.enemyCharacters.push(char);
        }
    }
    //console.log(`Nearby characters took ${ms((Date.now() - current_time))}`);
    return data;
}