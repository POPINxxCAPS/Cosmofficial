const gridModel = require('../models/gridSchema');
const chatModel = require('../models/chatSchema');
const serverLogModel = require('../models/serverLogSchema');
const hooverSettingModel = require('../models/hooverSettingSchema');
const deleteGrid = require('../functions_execution/gridDelete');

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
    if(cancel === true) return;
    
    // Check if hoover settings should be loaded/used
    const guild = client.guilds.cache.get(guildID);
    const mainGuild = client.guilds.cache.get("853247020567101440");

    // Economy Settings
    let patron = false;
    let guildOwner = mainGuild.members.cache.get(guild.owner.user.id);
    if (!guildOwner) return; // If guild owner is no longer in Cosmofficial discord

    if (guildOwner.roles.cache.has('883534965650882570') || guildOwner.roles.cache.has('883535930630213653')) {
        patron = true;
    }

    let hooverSettings;
    if (patron === true || patron === false ) { // added to make it free 
        hooverSettings = await hooverSettingModel.findOne({
            guildID: guildID
        })
    } else {
        return;
    }
    if(hooverSettings === null || hooverSettings.hooverEnabled === false) return;
    
    const gridData = await gridModel.find({
        guildID: guildID,
        queuedForDeletion: true
    })

    for(let i = 0; i < gridData.length; i++) {
        let grid = gridData[i];
        if(grid.queuedForDeletion === true) {
            if(parseInt(grid.deletionTime) < current_time) {
                await serverLogModel.create({
                    guildID: guildID,
                    category: 'removedByBot',
                    string: `${grid.displayName} Deleted, ${grid.deletionReason}.`
                })
                deleteGrid(guildID, grid.entityID);
                grid.remove();
            }
        }
    }

    return;
}