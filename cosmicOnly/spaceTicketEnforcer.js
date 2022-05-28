const spaceTicketModel = require('../models/spaceTicketSchema');
const gridModel = require('../models/gridSchema');
const gridDelete = require('../functions/execution/gridDelete');
const verificationModel = require('../models/verificationSchema');
const ms = require('ms')


const spawnerGridNames = ['Zone Chip Spawner', 'Ice Spawner', 'Iron Spawner', 'Silicon Spawner', 'Cobalt Spawner', 'Silver Spawner', 'Magnesium Spawner', 'Gold Spawner', 'Platinum Spawner', 'Uranium Spawner', 'Powerkit Spawner']

const guildID = '799685703910686720'
module.exports = (client) => {
    let running = false;
    let cache;
    setInterval(async (running) => {
        if(running === true) return;
        running = true;
        const NPCNames = client.commonVars.get('NPCNames');
        const NPCGridNames = client.commonVars.get('NPCGridNames');
        const spawnerGridNames = client.commonVars.get('respawnShipNames');
        let gridDocs = client.gridDocCache.get(guildID);
        if(gridDocs === cache) return running = false; // Cancel if already ran for this cache
        let guild = await client.guilds.cache.get(guildID);
        const current_time = Date.now();
        if (gridDocs === undefined) return running = false;
        if (gridDocs.length === 0) return running = false;

        let allowedFactionTags = [];
        let spaceTicketDocs = await spaceTicketModel.find({})
        for (let i = 0; i < spaceTicketDocs.length; i++) {
            //console.log(`Faction: ${spaceTicketDocs[i].factionTag} Space Ticket Time Remaining: ${ms(parseInt(spaceTicketDocs[i].expirationTime) - current_time)}`);
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
            let index = gridDocs.indexOf(grid);
            if (NPCNames.includes(grid.ownerDisplayName) === true || grid.ownerDisplayName.includes(" CEO") === true) continue;
            if (grid.queuedForDeletion === true && grid.deletionReason !== 'left permitted boundaries') continue;
            let inBoundary = false;
            let deleteGrid = false;
            if(allowedFactionTags.includes(grid.factionTag) === true) inBoundary = true;
            for (const buoy of buoyDocs) { // Check if grid is within a boundary buoy
                if(inBoundary === true) continue;
                let cutString = buoy.displayName.replace('Lane Buoy', '');
                let radius = cutString === '' ? 50000 : parseInt(cutString);

                var dx = grid.positionX - buoy.positionX;
                var dy = grid.positionY - buoy.positionY;
                var dz = grid.positionZ - buoy.positionZ;

                let distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                if (distance < radius) {
                    inBoundary = true;
                    //console.log(`${grid.displayName} In Boundary: ${inBoundary}`)
                }
            }

            if(inBoundary === false) {
                if(allowedFactionTags.includes(grid.factionTag) === false) deleteGrid = true;
                if(allowedFactionTags.includes(grid.factionTag) === true) deleteGrid = false;
            } else {
                deleteGrid = false;
            }
            if (deleteGrid === true && grid.queuedForDeletion === false) {
                // Check if there is a space ticket, if not do grid deletion
                // Grid Deletion Marking Stuff
                grid.deletionReason = 'left permitted boundaries'
                grid.queuedForDeletion = true;
                grid.deletionTime = current_time + 300000;
                try{
                    grid.save().then(savedDoc => {
                        gridDocs[index] = savedDoc;
                    }).catch(err => {})
                } catch(err) {}
                
                let verDoc = await verificationModel.findOne({
                    username: grid.ownerDisplayName
                })
                if (verDoc !== null) {
                    let memberTarget = await guild.members.cache.find(member => member.id === verDoc.userID)
                    try {
                        memberTarget.send(`**__Warning__**\n>>> ${grid.displayName} has left the Cosmic Boundary.\nBuy a Space Ticket with c!bst or re-enter the zones.\nOtherwise, grid will be removed in ~5 minutes.`)
                    } catch (err) {}
                }
            } else if(grid.queuedForDeletion === true) {
                // Remove queue status from grids that re-enter zones or buy a space ticket
                grid.deletionReason = '';
                grid.queuedForDeletion = false;
                try{
                    grid.save().then(savedDoc => {
                        gridDocs[index] = savedDoc;
                    }).catch(err => {})
                } catch(err) {}
            }
        }
        client.gridDocCache.set(guildID, gridDocs); // Update the cached info with the most recent changes
        running = false;
        cache = gridDocs
    }, 45000)
}