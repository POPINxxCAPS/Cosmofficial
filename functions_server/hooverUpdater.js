const gridModel = require('../models/gridSchema');
const chatModel = require('../models/chatSchema');
const hooverSettingModel = require('../models/hooverSettingSchema');
const verificationModel = require('../models/verificationSchema');
const spaceTicketModel = require('../models/spaceTicketSchema');
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
}]

module.exports = async (guildID, settings, client) => {
    const current_time = Date.now();
    if (settings.serverOnline === 'false' || settings.serverOnline === undefined) return;
    let cancel = false;
    let chatDoc = await chatModel.findOne({
        guildID: guildID
    })
    if (chatDoc === null) return;
    for (let i = 0; i < chatDoc.chatHistory.length; i++) {
        let chat = chatDoc.chatHistory[i];
        if (chat.content.includes('WARNING! Server will restart in 5 minutes') && (current_time - chat.msTimestamp) < 420000) {
            cancel = true;
        }
    }
    if (cancel === true) return;

    // Check if hoover settings should be loaded/used
    const guild = client.guilds.cache.get(guildID);
    const mainGuild = client.guilds.cache.get("853247020567101440");

    let patron = false;
    let guildOwner = mainGuild.members.cache.get(guild.owner.user.id);
    if (!guildOwner) return; // If guild owner is no longer in Cosmofficial discord

    if (guildOwner.roles.cache.has('883534965650882570') || guildOwner.roles.cache.has('883535930630213653')) {
        patron = true;
    }

    let hooverSettings;
    if (patron === true || patron === false /* added to make it free */ ) {
        hooverSettings = await hooverSettingModel.findOne({
            guildID: guildID
        })
    } else {
        return;
    }
    if (hooverSettings === null || hooverSettings.hooverEnabled === false) return;






    // Check if any grids queued for deletion need an update
    const gridData = await gridModel.find({
        guildID: guildID,
        queuedForDeletion: true
    })

    for (let i = 0; i < gridData.length; i++) {
        let grid = gridData[i];
        if (grid.deletionReason === 'unpowered') {
            if (grid.isPowered === true) {
                grid.queuedForDeletion = false
                try {
                    grid.save();
                } catch(err) {}
                let verDoc = await verificationModel.findOne({
                    username: grid.ownerDisplayName
                })
                if (verDoc !== null) {
                    let memberTarget = await guild.members.cache.find(member => member.id === verDoc.userID)
                    try {
                        //memberTarget.send(`**__Issue Fixed__**\n>>> ${check.displayName} is now powered.\nGrid no longer queued for deletion.`)
                    } catch (err) {}
                }
            }
        }

        if (grid.deletionReason === 'no clear owner') {
            if (grid.ownerDisplayName !== '') {
                let verDoc = await verificationModel.findOne({
                    username: grid.ownerDisplayName
                })
                if (verDoc !== null) {
                    let memberTarget = await guild.members.cache.get(verDoc.userID);
                    if (memberTarget === null || memberTarget === undefined) {
                        grid.deletionReason = 'player left the discord'
                    } else {
                        grid.queuedForDeletion = false;
                        let memberTarget = await guild.members.cache.find(member => member.id === verDoc.userID)
                        try {
                            //memberTarget.send(`**__Issue Fixed__**\n>>> ${check.displayName} now has a clear owner.\nGrid no longer queued for deletion.`)
                        } catch (err) {}
                    }
                    try {
                        grid.save();
                    } catch(err) {}
                } else { // If ver doc is null
                    grid.deletionReason = 'unverified player grid'
                    try {
                        grid.save();
                    } catch(err) {}
                }
            }
        }

        if (grid.deletionReason === 'unverified player grid') {
            let verDoc = await verificationModel.findOne({
                username: grid.ownerDisplayName
            })
            if (verDoc !== null) {
                let memberTarget = await guild.members.cache.get(verDoc.userID);
                if (memberTarget === null || memberTarget === undefined) {
                    grid.deletionReason = 'player left the discord'
                } else {
                    grid.queuedForDeletion = false;
                    let memberTarget = await guild.members.cache.find(member => member.id === verDoc.userID)
                    try {
                        //memberTarget.send(`**__Issue Fixed__**\n>>> You verified! ${check.displayName} no longer queued for deletion.`)
                    } catch (err) {}
                }
                try {
                    grid.save();
                } catch(err) {}
            }
        }

        if (grid.deletionReason === 'small grids not allowed') {
            if (grid.isPowered === true) {
                grid.queuedForDeletion = false
                try {
                    grid.save();
                } catch(err) {}
            }
        }

        if (grid.deletionReason === 'large grids not allowed') {
            if (grid.isPowered === true) {
                grid.queuedForDeletion = false
                try {
                    grid.save();
                } catch(err) {}
            }
        }

        if (grid.deletionReason === 'less than block threshold') {
            if (parseInt(grid.blocksCount) > hooverSettings.blockThreshold) {
                grid.queuedForDeletion = false
                try {
                    grid.save();
                } catch(err) {}
                let verDoc = await verificationModel.findOne({
                    username: grid.ownerDisplayName
                })
                if (verDoc !== null) {
                    let memberTarget = await guild.members.cache.find(member => member.id === verDoc.userID)
                    try {
                       // memberTarget.send(`**__Issue Fixed__**\n>>> ${check.displayName} is now over ${hooverSettings.blockThreshold} blocks.\nGrid no longer queued for deletion.`)
                    } catch (err) {
                        console.log(err)
                    }
                }
            }
        }

        if (grid.deletionReason === 'player left the discord') {
            let owner = grid.ownerDisplayName
            let verDoc = await verificationModel.findOne({
                username: owner
            })
            if (verDoc !== null) {
                let memberTarget = guild.members.cache.get(verDoc.userID);
                if (memberTarget === null || memberTarget === undefined) {
                    grid.deletionReason = 'player left the discord'
                } else {
                    grid.queuedForDeletion = false;
                }
                try {
                    grid.save();
                } catch(err) {}
            } else { // If ver doc is null
                grid.deletionReason = 'unverified player grid'
                try {
                    grid.save();
                } catch(err) {}
            }
        }


        if (grid.deletionReason === 'off-planet') {
            let inSpace = true;
            if(NPCNames.includes(grid.ownerDisplayName) === true) {
                inSpace = false
            }
            for (let a = 0; a < planetLocations.length && inSpace === true; a++) {
                var dx = grid.positionX - planetLocations[a].x;
                var dy = grid.positionY - planetLocations[a].y;
                var dz = grid.positionZ - planetLocations[a].z;

                let distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                if (distance < planetLocations[a].distanceLimit) {
                    inSpace = false;
                }
            }
            let spaceTicketDoc = await spaceTicketModel.findOne({
                factionTag: grid.factionTag
            })
            

            try {
                if(inSpace === false) {
                    grid.queuedForDeletion = false;
                    grid.save();
                } else if(spaceTicketDoc !== null) {
                    if(spaceTicketDoc.expirationTime < current_time) {
                        grid.queuedForDeletion = false;
                        grid.save();
                    }
                }
            } catch(err) {}
        }
    }

    return;
}