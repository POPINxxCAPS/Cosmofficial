const spaceTicketModel = require('../models/spaceTicketSchema');
const gridModel = require('../models/gridSchema');
const gridDelete = require('../functions/execution/gridDelete');
const verificationModel = require('../models/verificationSchema');


const NPCNames = ['The Tribunal', 'Contractors', 'Gork and Mork', 'Space Pirates', 'Space Spiders', 'The Chairman', 'Miranda Survivors', 'VOID', 'The Great Tarantula', 'Cosmofficial', 'Clang Technologies CEO', 'Merciless Shipping CEO', 'Mystic Settlers CEO', 'Royal Drilling Consortium CEO', 'Secret Makers CEO', 'Secret Prospectors CEO', 'Specialized Merchants CEO', 'Star Inventors CEO', 'Star Minerals CEO', 'The First Heavy Industry CEO', 'The First Manufacturers CEO', 'United Industry CEO', 'Universal Excavators CEO', 'Universal Miners Guild CEO', 'Unyielding Excavators CEO'];
const NPCGridNames = ['Mining vessel Debris', 'Mining ship Debris', 'Daniel A. Collins', 'Transporter debree']
const spawnerGridNames = ['Zone Chip Spawner', 'Ice Spawner', 'Iron Spawner', 'Silicon Spawner', 'Cobalt Spawner', 'Silver Spawner', 'Magnesium Spawner', 'Gold Spawner', 'Platinum Spawner', 'Uranium Spawner', 'Powerkit Spawner']
const respawnShipNames = ['Respawn Station', 'Respawn Planet Pod', 'Respawn Space Pod']


const planetLocations = [{
    name: '1',
    x: -128934,
    y: 76266,
    z: -160,
    distanceLimit: 69180
}, {
    name: '2',
    x: 76188,
    y: 76074,
    z: 101525,
    distanceLimit: 69180
}, {
    name: '3',
    x: 76194,
    y: 76180,
    z: -101442,
    distanceLimit: 69180
}, {
    name: '1-1',
    x: -128483,
    y: -75875,
    z: 39,
    distanceLimit: 69180
}, {
    name: '1-2',
    x: 75982,
    y: -75867,
    z: -101133,
    distanceLimit: 69180
}, {
    name: '1-3',
    x: 75875,
    y: -75845,
    z: 101071,
    distanceLimit: 69180
}]

const laneCordCache = [{
    radius: 30000,
    rA: [planetLocations[0].x, planetLocations[0].y, planetLocations[0].z],
    rB: [planetLocations[3].x, planetLocations[3].y, planetLocations[3].z]
}, ]
const guildID = '871727543491911691'
module.exports = (client) => {
    setInterval(async () => {
        let gridDocs = client.gridDocCache.get(guildID);
        if(gridDocs === undefined) return;
        if (gridDocs.length === 0) return;

        let allowedFactionTags = [];
        let spaceTicketDocs = await spaceTicketModel.find({})
        for (let i = 0; i < spaceTicketDocs.length; i++) {
            allowedFactionTags.push(spaceTicketDocs[i].factionTag)
        }

        for (let i = 0; i < gridDocs.length; i++) {
            let grid = gridDocs[i];
            if (NPCNames.includes(grid.ownerDisplayName) === true) continue;
            let inLane = false;
            let onPlanet = false;
            for (let a = 0; a < planetLocations.length; a++) { // Check if grid is within a planet
                var dx = gridDocs[i].positionX - planetLocations[a].x;
                var dy = gridDocs[i].positionY - planetLocations[a].y;
                var dz = gridDocs[i].positionZ - planetLocations[a].z;

                let distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                if (distance < planetLocations[a].distanceLimit) {
                    onPlanet = true;
                }
            }

            
            for(const laneCords of laneCordCache) {
                const rP = [parseInt(gridDocs[i].positionX), parseInt(gridDocs[i].positionY), parseInt(gridDocs[i].positionZ)];
                const e = [laneCords.rB[0] - laneCords.rA[0], laneCords.rB[1] - laneCords.rA[1], laneCords.rB[2] - laneCords.rA[2]];
                const m = [laneCords.rA[0] * laneCords.rB[0], laneCords.rA[1] * laneCords.rB[1], laneCords.rA[2] * laneCords.rB[2]];
                const rPrA = [rP[0] - laneCords.rA[0], rP[1] - laneCords.rA[1], rP[2] - laneCords.rA[2]]
                const ErPrA = [e[0] * rPrA[0], e[1] * rPrA[1], e[2] * rPrA[2]]            
                let distance = (ErPrA[0] / e[0], ErPrA[1] / e[1], ErPrA[2] / e[2])
                console.log(`${gridDocs[i].displayName} Distance to infinite line: ${distance}`);
                if(distance < laneCords.radius) { // If grid is within range of the infinite line, check if it's breached the ends of the cylinder
                var dx = laneCords.rB[0] - laneCords.rA[0];
                var dy = laneCords.rB[1] - laneCords.rA[1];
                var dz = laneCords.rB[2] - laneCords.rA[2];
                let lineLength = Math.sqrt(dx * dx + dy * dy + dz * dz);

                dx = gridDocs[i].positionX - laneCords.rA[0];
                dy = gridDocs[i].positionY - laneCords.rA[1];
                dz = gridDocs[i].positionZ - laneCords.rA[2];
                let planetDistanceOne = Math.sqrt(dx * dx + dy * dy + dz * dz);

                dx = gridDocs[i].positionX - laneCords.rB[0];
                dy = gridDocs[i].positionY - laneCords.rB[1];
                dz = gridDocs[i].positionZ - laneCords.rB[2];
                let planetDistanceTwo = Math.sqrt(dx * dx + dy * dy + dz * dz);
                // If grid distance from each planet is less than total distance between both planets, it has not breached the end cap
                if(planetDistanceOne < lineLength && planetDistanceTwo < lineLength) inLane = true;
                }
            }


            const current_time = Date.now()
/*
            if (inLane === false && onPlanet === false && gridDocs[i].queuedForDeletion === false) { // Check if there is a space ticket, if not do grid deletion
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

            */
        }
    }, 20000)
}