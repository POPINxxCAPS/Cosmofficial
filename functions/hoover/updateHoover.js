const makeHooverSettingVar = require('../misc/makeHooverSettingVar');
const timerFunction = require('../database/timerFunction');



const NPCNames = ['The Tribunal', 'Contractors', 'Gork and Mork', 'Space Pirates', 'Space Spiders', 'The Chairman', 'Miranda Survivors', 'VOID', 'The Great Tarantula', 'Cosmofficial', 'Clang Technologies CEO', 'Merciless Shipping CEO', 'Mystic Settlers CEO', 'Royal Drilling Consortium CEO', 'Secret Makers CEO', 'Secret Prospectors CEO', 'Specialized Merchants CEO', 'Star Inventors CEO', 'Star Minerals CEO', 'The First Heavy Industry CEO', 'The First Manufacturers CEO', 'United Industry CEO', 'Universal Excavators CEO', 'Universal Miners Guild CEO', 'Unyielding Excavators CEO'];
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
        const verDoc = verificationCache.find(verification => verification.username === gridDoc.ownerDisplayName)
        // First, if it's already queued for deletion see if the error has been resolved
        if (gridDoc.queuedForDeletion === true) {
            let queued = true;
            if (gridDoc.deletionReason === 'unpowered' && gridDoc.isPOwered === true) queued = false;
            if (gridDoc.deletionReason === 'no clear owner' && gridDoc.ownerDisplayName !== '') queued = false;
            if (gridDoc.deletionReason === 'unverified player grid' && verDoc !== null) queued = false;
            if (gridDoc.deletionReason === 'small grids not allowed' && smallGrids === true) queued = false;
            if (gridDoc.deletionReason === 'large grids not allowed' && largeGrids === true) queued = false;
            if (gridDoc.deletionReason === 'less than block threshold' && parseInt(gridDoc.blocksCount) > blockThreshold) queued = false;
            if (gridDoc.deletionReason === 'player left the discord' && verDoc !== null) {
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

            if (gridDoc.deletionReason === 'off-planet') { // Cosmic only, space tickets
                let inSpace = true;
                if (NPCNames.includes(gridDoc.ownerDisplayName) === true) {
                    inSpace = false
                }
                for (let a = 0; a < planetLocations.length && inSpace === true; a++) {
                    var dx = gridDoc.positionX - planetLocations[a].x;
                    var dy = gridDoc.positionY - planetLocations[a].y;
                    var dz = gridDoc.positionZ - planetLocations[a].z;

                    let distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                    if (distance < planetLocations[a].distanceLimit) {
                        inSpace = false;
                    }
                }
                const spaceTicketDoc = await spaceTicketModel.findOne({
                    factionTag: gridDoc.factionTag
                })
                if (spaceTicketDoc !== null) {
                    if (spaceTicketDoc.expirationTime > current_time) queued = false;
                }
                if (inSpace === false) queued = false;
                if (guildID !== '799685703910686720') queued = false;
            }

            if (queued === false) {
                gridDoc.queuedForDeletion = false;
                gridDoc.deletionReason = '';
            }
        }



        // Large Grid Check
        if (gridDoc.queuedForDeletion === false && gridDoc.GridSize === 'Large' && largeGrids === false) {
            gridDoc.deletionReason = 'large grids not allowed'
            gridDoc.queuedForDeletion = true;
            gridDoc.deletionTime = sweepDelay;
        }
        // Small Grid Check
        if (gridDoc.queuedForDeletion === false && gridDoc.GridSize === 'Small' && smallGrids === false) {
            gridDoc.deletionReason = 'small grids not allowed'
            gridDoc.queuedForDeletion = true;
            gridDoc.deletionTime = sweepDelay;
        }
        // Block Threshold Check
        if (gridDoc.queuedForDeletion === false && gridDoc.blocksCount < parseInt(blockThreshold) && NPCGridNames.includes(singlegridDoc.DisplayName) === false && NPCNames.includes(singlegridDoc.OwnerDisplayName) === false) {
            gridDoc.deletionReason = 'less than block threshold'
            gridDoc.queuedForDeletion = true;
            gridDoc.deletionTime = sweepDelay;
        }
        // Power Check
        if (gridDoc.queuedForDeletion === false && gridDoc.IsPowered === false && unpoweredGrids === true && NPCNames.includes(singlegridDoc.OwnerDisplayName) === false) {
            gridDoc.deletionReason = 'unpowered'
            gridDoc.queuedForDeletion = true;
            gridDoc.deletionTime = sweepDelay;
        }
        // Verification Check
        if (gridDoc.queuedForDeletion === false && unverifiedRemoval === false) { // If unverified cleanup is enabled
            if ((verDoc === null || verDoc === undefined) === true && gridDoc.queuedForDeletion === false && NPCNames.includes(singlegridDoc.OwnerDisplayName) === false) { // If verdoc is not found, and grid is not already queued for deletion
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
        // Speed Check
        if (gridDoc.queuedForDeletion === false && parseInt(gridDoc.linearSpeed) > maxSpeed) {
            gridDoc.deletionReason = 'bypassing speed limits';
            gridDoc.deletionTime = current_time + 60000;
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
                gridDoc.deletionTime = current_time + 600000;
                gridDoc.queuedForDeletion = true
            }
        }

        // Save doc
        gridDoc.save().then(savedDoc => {
            gridDoc = savedDoc;
            gridDocsCache[cacheIndex] = gridDoc;
        })
    }
    return gridDocsCache;
}