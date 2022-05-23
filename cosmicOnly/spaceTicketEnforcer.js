const spaceTicketModel = require('../models/spaceTicketSchema');
const gridModel = require('../models/gridSchema');
const gridDelete = require('../functions/execution/gridDelete');
const verificationModel = require('../models/verificationSchema');


const spawnerGridNames = ['Zone Chip Spawner', 'Ice Spawner', 'Iron Spawner', 'Silicon Spawner', 'Cobalt Spawner', 'Silver Spawner', 'Magnesium Spawner', 'Gold Spawner', 'Platinum Spawner', 'Uranium Spawner', 'Powerkit Spawner']

const guildID = '799685703910686720'
module.exports = (client) => {
    let running = false;
    setInterval(async (running) => {
        if(running === true) return;
        running = true;
        const NPCNames = client.commonVars.get('NPCNames');
        const NPCGridNames = client.commonVars.get('NPCGridNames');
        const spawnerGridNames = client.commonVars.get('respawnShipNames');
        let gridDocs = client.gridDocCache.get(guildID);
        let guild = await client.guilds.cache.get(guildID);
        const current_time = Date.now();
        if (gridDocs === undefined) return running = false;
        if (gridDocs.length === 0) return running = false;

        let allowedFactionTags = [];
        let spaceTicketDocs = await spaceTicketModel.find({})
        for (let i = 0; i < spaceTicketDocs.length; i++) {
            if (parseInt(spaceTicketDocs[i].expirationTime) > current_time) {
                allowedFactionTags.push(spaceTicketDocs[i].factionTag);
            } else continue;
        }

        let buoyDocs = [];
        for (const grid of gridDocs) {
            if (grid.displayName.includes('Lane Buoy') && grid.ownerDisplayName === 'Cosmofficial') {
                buoyDocs.push(grid);
            } else continue;
        }

        for (let grid of gridDocs) {
            if(allowedFactionTags.includes(grid.factionTag) === true) continue;
            let index = gridDocs.indexOf(grid);
            if (NPCNames.includes(grid.ownerDisplayName) === true || grid.ownerDisplayName.includes(" CEO") === true) continue;
            if (grid.queuedForDeletion === true && grid.deletionReason !== 'left permitted boundaries') continue;
            let inBoundary = false;
            for (const buoy of buoyDocs) { // Check if grid is within a boundary buoy
                let cutString = buoy.displayName.replace('Lane Buoy', '');
                let radius = cutString === '' ? 50000 : parseInt(cutString);

                var dx = grid.positionX - buoy.positionX;
                var dy = grid.positionY - buoy.positionY;
                var dz = grid.positionZ - buoy.positionZ;

                let distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                if (distance < radius) {
                    inBoundary = true;
                }
            }

            if (inBoundary === false && grid.queuedForDeletion === false) { // Check if there is a space ticket, if not do grid deletion
                // Grid Deletion Marking Stuff
                grid.deletionReason = 'left permitted boundaries'
                grid.queuedForDeletion = true;
                grid.deletionTime = current_time + 150000;
                grid.save().then(savedDoc => {
                    gridDocs[index] = savedDoc;
                })
                let verDoc = await verificationModel.findOne({
                    username: grid.ownerDisplayName
                })
                if (verDoc !== null) {
                    let memberTarget = await guild.members.cache.find(member => member.id === verDoc.userID)
                    try {
                        memberTarget.send(`**__Warning__**\n>>> ${grid.displayName} has left the Cosmic Boundary.\nBuy a Space Ticket with c!bst or re-enter the zones.\nOtherwise, grid will be removed in ~2-5 minutes.`)
                    } catch (err) {}
                }
            } else if(grid.queuedForDeletion === true && (inBoundary === true || allowedFactionTags.includes(grid.factionTag === true)) === true) {
                grid.deletionReason = '';
                grid.queuedForDeletion = false;
                grid.save().then(savedDoc => {
                    gridDocs[index] = savedDoc;
                })
            }
        }
        client.gridDocCache.set(guildID, gridDocs); // Update the cached info with the most recent changes
        running = false;
    }, 20000)
}