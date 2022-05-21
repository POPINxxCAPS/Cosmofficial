const makeHooverSettingVar = require('../misc/makeHooverSettingVar');
const timerFunction = require('../database/timerFunction');
const spaceTicketModel = require('../../models/spaceTicketSchema');


const planetLocations = [{
    x: -2043,
    y: -1621,
    z: -2921,
    distanceLimit: 69180
}, {
    x: -1581,
    y: 7502964,
    z: -337,
    distanceLimit: 120000
}, {
    x: 7499,
    y: -7492234,
    z: -4462,
    distanceLimit: 120000
}, {
    x: -7501573,
    y: -728,
    z: 1184,
    distanceLimit: 120000
}, {
    x: 7502964,
    y: 115,
    z: 337,
    distanceLimit: 120000
}] // Only needed for space tickets (cosmic only)
module.exports = async (req) => {
    const guildID = req.guildID;
    const guild = req.client.guilds.cache.get(guildID);
    const settings = req.settings;
    let gridDocsCache = req.gridDocsCache;
    const verificationCache = req.verDocs;
    const hooverSettings = await makeHooverSettingVar(guildID, settings);
    if (hooverSettings === null || hooverSettings === undefined) return gridDocsCache;
    if (hooverSettings.enabled === 'Not Set' || hooverSettings.enabled === 'false') return gridDocsCache;
    const NPCNames = req.client.commonVars.get('NPCNames')
    const NPCGridNames = req.client.commonVars.get('NPCGridNames')
    const respawnShipNames = req.client.commonVars.get('respawnShipNames')
    const scanInterval = hooverSettings.scanInterval === 'Not Set' ? 300 : hooverSettings.scanInterval / 1000;
    const sweepDelay = hooverSettings.sweepDelay === 'Not Set' ? 300 : hooverSettings.sweepDelay / 1000;
    const unpoweredGrids = hooverSettings.unpoweredGrids === 'Not Set' ? 'false' : hooverSettings.unpoweredGrids;
    const largeGrids = hooverSettings.largeGrids === 'Not Set' ? 'false' : hooverSettings.largeGrids;
    const smallGrids = hooverSettings.smallGrids === 'Not Set' ? 'false' : hooverSettings.smallGrids;
    const blockThreshold = hooverSettings.blockThreshold === 'Not Set' ? 1000000 : parseInt(hooverSettings.blockThreshold);
    const maxSpeed = hooverSettings.maxSpeed === 'Not Set' ? 1000000 : parseInt(hooverSettings.maxSpeed);
    const worldBorder = hooverSettings.worldBorder === 'Not Set' ? 1000000000 : parseInt(hooverSettings.worldBorder);
    const unverifiedRemoval = hooverSettings.unverifiedRemoval === 'Not Set' ? 'false' : hooverSettings.unverifiedRemoval;
    req.name = 'updateHoover'
    req.expirationInSeconds = scanInterval / 1000;
    if (req.expirationInSeconds < 30) req.expirationInSeconds = 30;
    const timer = await timerFunction(req);
    if (timer === true) return gridDocsCache; // If there is a timer, cancel.
    const current_time = Date.now();
    const deletionTime = current_time + (sweepDelay * 1000);
    for (let gridDoc of gridDocsCache) {
        const cacheIndex = gridDocsCache.indexOf(gridDoc);
        if(gridDoc === undefined) { // Fixing weird occurance
            gridDocsCache.splice(cacheIndex, 1);
            continue;
        }
        const verDoc = verificationCache.find(verification => verification.username === gridDoc.ownerDisplayName)
        // First, if it's already queued for deletion, see if the error has been resolved
        if (gridDoc.queuedForDeletion === true) {
            let queued = true;
            if (gridDoc.deletionReason === 'unpowered' && gridDoc.isPowered === true) queued = false;
            if (gridDoc.deletionReason === 'no clear owner' && gridDoc.ownerDisplayName !== '') queued = false;
            if (gridDoc.deletionReason === 'unverified player grid' && verDoc !== null && verDoc !== undefined) queued = false;
            if (gridDoc.deletionReason === 'small grids not allowed' && smallGrids === true) queued = false;
            if (gridDoc.deletionReason === 'large grids not allowed' && largeGrids === true) queued = false;
            if (gridDoc.deletionReason === 'less than block threshold' && parseInt(gridDoc.blocksCount) > blockThreshold) queued = false;
            if (gridDoc.deletionReason === 'player left the discord' && verDoc !== null && verDoc !== undefined) {
                const memberTarget = guild.members.cache.get(verDoc.userID);
                if (memberTarget !== null && memberTarget !== undefined) queued = false;
            }
            if (gridDoc.deletionReason === 'bypassing speed limits' && parseInt(gridDoc.linearSpeed) < maxSpeed) queued = false;
            if (gridDoc.deletionReason === 'out of world boundary') {
                var dx = gridDoc.positionX - 0;
                var dy = gridDoc.positionY - 0;
                var dz = gridDoc.positionZ - 0;

                let distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                if (distance < (worldBorder * 1000)) queued = false;
            }

            if (queued === false) {
                gridDoc.queuedForDeletion = false;
                gridDoc.deletionReason = '';
            }
        }
        // Afterwards, check for hoover sweeps


        // Large Grid Check
        if (gridDoc.queuedForDeletion === false && gridDoc.gridSize === 'Large' && largeGrids === 'true') {
            gridDoc.deletionReason = 'large grids not allowed'
            gridDoc.queuedForDeletion = true;
            gridDoc.deletionTime = deletionTime
        }
        // Small Grid Check
        if (gridDoc.queuedForDeletion === false && gridDoc.gridSize === 'Small' && smallGrids === 'true') {
            gridDoc.deletionReason = 'small grids not allowed'
            gridDoc.queuedForDeletion = true;
            gridDoc.deletionTime = deletionTime
        }
        // Block Threshold Check
        if (gridDoc.queuedForDeletion === false && gridDoc.blocksCount < parseInt(blockThreshold)) {
            const modifiedDeletionTime = current_time + Math.round((sweepDelay * 1000) * 0.33);
            gridDoc.deletionReason = 'less than block threshold'
            gridDoc.queuedForDeletion = true;
            gridDoc.deletionTime = modifiedDeletionTime;
        }
        // Power Check
        if (gridDoc.queuedForDeletion === false && gridDoc.isPowered === false && unpoweredGrids === 'true') {
            gridDoc.deletionReason = 'unpowered'
            gridDoc.queuedForDeletion = true;
            gridDoc.deletionTime = deletionTime
        }
        // Verification Check
        if (gridDoc.queuedForDeletion === false && unverifiedRemoval === 'true') { // If unverified cleanup is enabled
            if ((verDoc === null || verDoc === undefined) === true && gridDoc.queuedForDeletion === false && NPCNames.includes(gridDoc.OwnerDisplayName) === false) { // If verdoc is not found, and grid is not already queued for deletion
                // If no verification
                if (gridDoc.ownerDisplayName === '') {
                    // No owner? (no terminal blocks)
                    gridDoc.deletionReason = 'no clear owner'
                    gridDoc.queuedForDeletion = true;
                    gridDoc.deletionTime = deletionTime
                } else {
                    // Has an owner, player just isn't verified.
                    gridDoc.deletionReason = 'unverified player grid'
                    gridDoc.queuedForDeletion = true;
                    gridDoc.deletionTime = deletionTime
                }
            } else {
                // If there is a verification doc, confirm they are still in the discord.
                let memberTarget = guild.members.cache.find(member => member.id === verDoc.userID)
                if (memberTarget === null || memberTarget === undefined) {
                    // No longer in the discord
                    gridDoc.deletionReason = 'player left the discord'
                    gridDoc.queuedForDeletion = true;
                    gridDoc.deletionTime = deletionTime
                } // Discord check end
            }
        }
        // Speed Check
        if (gridDoc.queuedForDeletion === false && parseInt(gridDoc.linearSpeed) > maxSpeed) {
            gridDoc.deletionReason = 'bypassing speed limits';
            gridDoc.deletionTime = current_time + 60000; // Deletes in 60 seconds if still bypassing speed limits by then.
            gridDoc.queuedForDeletion = true
        }
        // World Boundary Check
        if (gridDoc.queuedForDeletion === false) {
            var dx = gridDoc.positionX - 0;
            var dy = gridDoc.positionY - 0;
            var dz = gridDoc.positionZ - 0;
            let distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (distance > (worldBorder * 1000)) {
                gridDoc.deletionReason = 'out of world boundary';
                gridDoc.deletionTime = current_time + 600000; // Gives 10 minutes to return in-boundary
                gridDoc.queuedForDeletion = true
            }
        }

        if (NPCNames.includes(gridDoc.ownerDisplayName) === true || gridDoc.ownerDisplayName.includes(' CEO')) { // Remove queued status from NPC grids
            gridDoc.queuedForDeletion = false;
            gridDoc.deletionReason = '';
        }
        
        gridDocsCache[cacheIndex] = gridDoc;
    }
    return gridDocsCache;
}