const makeHooverSettingVar = require('../misc/makeHooverSettingVar');
const timerFunction = require('../database/timerFunction');
module.exports = async (req) => {
    const guildID = req.guildID;
    const settings = req.settings;
    let gridDocsCache = req.gridDocsCache;
    const verificationCache = req.verDocs;
    const hooverSettings = await makeHooverSettingVar(guildID, settings);
    if (hooverSettings === null || hooverSettings === undefined) return gridDocsCache;
    if (hooverSettings.enabled === 'Not Set' || hooverSettings.enabled === 'false') return gridDocsCache;
    const scanInterval = hooverSettings.scanInterval === 'Not Set' ? 300 : hooverSettings.scanInterval / 1000;
    const sweepDelay = hooverSettings.sweepDelay === 'Not Set' ? 300 : hooverSettings.sweepDelay / 1000;
    const unpoweredGrids = hooverSettings.unpoweredGrids === 'Not Set' ? 'false' : hooverSettings.unpoweredGrids;
    const largeGrids = hooverSettings.largeGrids === 'Not Set' ? 'false' : hooverSettings.largeGrids;
    const smallGrids = hooverSettings.smallGrids === 'Not Set' ? 'false' : hooverSettings.smallGrids;
    const blockThreshold = hooverSettings.blockThreshold === 'Not Set' ? 1000000 : parseInt(hooverSettings.blockThreshold);
    const maxSpeed = hooverSettings.maxSpeed === 'Not Set' ? 1000000 : parseInt(hooverSettings.maxSpeed);
    const worldBorder = hooverSettings.worldBorder === 'Not Set' ? 1000000000 : parseInt(hooverSettings.worldBorder);
    const unverifiedRemoval = hooverSettings.unverifiedRemoval === 'Not Set' ? 'false' : hooverSettings.unverifiedRemoval;

    if (hooverEnabled === 'false') return gridDocsCache;

    req.name = 'updateHoover'
    req.expirationInSeconds = scanInterval / 1000;
    if (req.expirationInSeconds < 30) req.expirationInSeconds = 30;
    req.name = 'logPlayers'
    const timer = await timerFunction(req);
    if (timer === true) return gridDocsCache; // If there is a timer, cancel.
    const current_time = Date.now();
    const deletionTime = current_time + sweepDelay;

    for (let gridDoc of gridDocsCache) {
        const cacheIndex = gridDocsCache.indexOf(gridDoc);
        const verDoc = verificationCache.find(verification => verification.username === gridDoc.ownerDisplayName)
        // Large Grid Check
        if (gridDoc.queuedForDeletion === false && singleGrid.GridSize === 'Large' && hooverSettings.largeGridAllowed === false) {
            gridDoc.deletionReason = 'large grids not allowed'
            gridDoc.queuedForDeletion = true;
            gridDoc.deletionTime = sweepDelay;
        }
        // Small Grid Check
        if (gridDoc.queuedForDeletion === false && singleGrid.GridSize === 'Small' && hooverSettings.smallGridAllowed === false) {
            gridDoc.deletionReason = 'small grids not allowed'
            gridDoc.queuedForDeletion = true;
            gridDoc.deletionTime = sweepDelay;
        }
        // Block Threshold Check
        if (gridDoc.queuedForDeletion === false && gridDoc.blocksCount < parseInt(hooverSettings.blockThreshold) && NPCGridNames.includes(singleGrid.DisplayName) === false && NPCNames.includes(singleGrid.OwnerDisplayName) === false) {
            gridDoc.deletionReason = 'less than block threshold'
            gridDoc.queuedForDeletion = true;
            gridDoc.deletionTime = sweepDelay;
        }
        // Power Check
        if (gridDoc.queuedForDeletion === false && singleGrid.IsPowered === false && hooverSettings.unpoweredGridRemoval === true && NPCNames.includes(singleGrid.OwnerDisplayName) === false) {
            gridDoc.deletionReason = 'unpowered'
            gridDoc.queuedForDeletion = true;
            gridDoc.deletionTime = sweepDelay;
        }
        // Verification Check
        if (hooverSettings.cleanUnverifiedPlayerGrids === false) { // If unverified cleanup is enabled
            if ((verDoc === null || verDoc === undefined) === true && gridDoc.queuedForDeletion === false && NPCNames.includes(singleGrid.OwnerDisplayName) === false) { // If verdoc is not found, and grid is not already queued for deletion
                // If no verification
                if (gridDoc.ownerDisplayName === '') {
                    // No owner? (no terminal blocks)
                    gridDoc.deletionReason = 'no clear owner'
                    gridDoc.queuedForDeletion = true;
                    gridDoc.deletionTime = sweepDelay;
                } else {
                    // Has an owner, player just isn't verified.
                    gridDoc.deletionReason = 'unverified player grid'
                    gridDoc.queuedForDeletion = true;
                    gridDoc.deletionTime = sweepDelay;
                }
            } else {
                // If there is a verification doc, confirm they are still in the discord.
                let memberTarget = guild.members.cache.find(member => member.id === verDoc.userID)
                if (memberTarget === null || memberTarget === undefined) {
                    // No longer in the discord
                    gridDoc.deletionReason = 'player left the discord'
                    gridDoc.queuedForDeletion = true;
                    gridDoc.deletionTime = sweepDelay;
                } // Discord check end
            }
        }
        gridDoc.save().then(savedDoc => {
            gridDoc = savedDoc;
            gridDocsCache[cacheIndex] = gridDoc;
        })
    }
    return gridDocsCache;
}