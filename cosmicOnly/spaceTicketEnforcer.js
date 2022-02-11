const spaceTicketModel = require('../models/spaceTicketSchema');
const gridModel = require('../models/gridSchema');
const gridDelete = require('../functions_execution/gridDelete');
const verificationModel = require('../models/verificationSchema');


const NPCNames = ['The Tribunal', 'Contractors', 'Gork and Mork', 'Space Pirates', 'Space Spiders', 'The Chairman', 'Miranda Survivors', 'VOID', 'The Great Tarantula', 'Cosmofficial', 'Clang Technologies CEO', 'Merciless Shipping CEO', 'Mystic Settlers CEO', 'Royal Drilling Consortium CEO', 'Secret Makers CEO', 'Secret Prospectors CEO', 'Specialized Merchants CEO', 'Star Inventors CEO', 'Star Minerals CEO', 'The First Heavy Industry CEO', 'The First Manufacturers CEO', 'United Industry CEO', 'Universal Excavators CEO', 'Universal Miners Guild CEO', 'Unyielding Excavators CEO'];
const NPCGridNames = ['Mining vessel Debris', 'Mining ship Debris', 'Daniel A. Collins', 'Transporter debree']
const spawnerGridNames = ['Zone Chip Spawner', 'Ice Spawner', 'Iron Spawner', 'Silicon Spawner', 'Cobalt Spawner', 'Silver Spawner', 'Magnesium Spawner', 'Gold Spawner', 'Platinum Spawner', 'Uranium Spawner', 'Powerkit Spawner']
const respawnShipNames = ['Respawn Station', 'Respawn Planet Pod', 'Respawn Space Pod']


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
}]

module.exports = (client) => {
    setInterval(async () => {
        let gridDocs = await gridModel.find({
            guildID: '799685703910686720'
        });
        if (gridDocs.length === 0) return;

        let allowedFactionTags = [];
        let spaceTicketDocs = await spaceTicketModel.find({})
        for (let i = 0; i < spaceTicketDocs.length; i++) {
            allowedFactionTags.push(spaceTicketDocs[i].factionTag)
        }

        for (let i = 0; i < gridDocs.length; i++) {
            let grid = gridDocs[i];
            if (NPCNames.includes(grid.ownerDisplayName) === false) {
                let inSpace = true;
                for (let a = 0; a < planetLocations.length; a++) {
                    var dx = gridDocs[i].positionX - planetLocations[a].x;
                    var dy = gridDocs[i].positionY - planetLocations[a].y;
                    var dz = gridDocs[i].positionZ - planetLocations[a].z;

                    let distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                    if (distance < planetLocations[a].distanceLimit) {
                        inSpace = false;
                    }
                }


                const current_time = Date.now()

                if (inSpace === true && gridDocs[i].queuedForDeletion === false) { // Check if there is a space ticket, if not do grid deletion
                    let spaceTicketDoc = await spaceTicketModel.findOne({
                        factionTag: gridDocs[i].factionTag
                    })
                    if (spaceTicketDoc !== null) {
                        if (spaceTicketDoc.expirationTime < current_time) {
                            // Grid Deletion Stuff
                            console.log(grid.displayName)
                            gridDocs[i].deletionReason = 'off-planet'
                            gridDocs[i].queuedForDeletion = true;
                            gridDocs[i].deletionTime = current_time + 300000;
                            gridDocs[i].save()
                            let verDoc = await verificationModel.findOne({
                                username: gridDocs[i].ownerDisplayName
                            })
                            let guild = await client.guilds.cache.get("853247020567101440");
                            if (verDoc !== null) {
                                let memberTarget = await guild.members.cache.find(member => member.id === verDoc.userID)
                                try {
                                    console.log(verDoc.username)

                                    memberTarget.send(`**__Warning__**\n>>> ${gridDocs[i].displayName} has left planetary zones.\nBuy a Space Ticket with c!bst or re-enter the zone.\nOtherwise, grid will be removed in 5 minutes.`)
                                } catch (err) {}
                            }
                        }
                    } else {
                        // If there is no space ticket
                        // Grid Deletion Stuff
                        console.log(grid.displayName)
                        gridDocs[i].deletionReason = 'off-planet'
                        gridDocs[i].queuedForDeletion = true;
                        gridDocs[i].deletionTime = current_time + 300000;
                        gridDocs[i].save()
                        let verDoc = await verificationModel.findOne({
                            username: gridDocs[i].ownerDisplayName
                        })
                        let guild = await client.guilds.cache.get("853247020567101440");
                        if (verDoc !== null) {
                            let memberTarget = await guild.members.cache.find(member => member.id === verDoc.userID)
                            try {
                                console.log(verDoc.username)
                                await memberTarget.send(`**__Warning__**\n>>> ${gridDocs[i].displayName} has left planetary zones.\nBuy a Space Ticket with c!bst or re-enter the zone.\nOtherwise, grid will be removed in 5 minutes.`)
                            } catch (err) {}
                        }
                    }
                }
            }
        }
    }, 90000)
}