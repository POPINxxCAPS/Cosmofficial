const playerModel = require('../models/playerSchema');
const verificationModel = require('../models/verificationSchema');
const errorEmbed = require('../functions_discord/errorEmbed');
const cooldownFunction = require('../functions_db/cooldownFunction');
const cooldownEmbed = require('../functions_discord/cooldownEmbed');

module.exports = async (username, userID, guildID, channelID) => {
    let cancel = false;
    let messageString = '';

    const playerDoc = await playerModel.findOne({
        username: username,
    })
    if (playerDoc === null) {
        if(channelID !== undefined) {
             errorEmbed(channelID, 'Username was not found in the database.\nHave you logged into a server running Cosmofficial?\nIf you are having trouble, use c!players while logged in to see the username reported by Space Engineers.');
        }
        return null;
    }


    let verDoc = await verificationModel.findOne({
        username: username
    })
    if (verDoc !== null) {
        if(channelID !== undefined) {
            errorEmbed(channelID, '')
        }
        return null;
    }

    
    verDoc = await verificationModel.findOne({
        userID: userID
    })
    if (verDoc !== null) { // If user was already verified previously, set a cooldown and change their verified username
        const cooldown = await cooldownFunction.cd('verify', 259200);
        if (cooldown !== undefined) {
            if(channelID !== undefined) {
                cooldownEmbed(channelID, cooldown, 'Timely', message.author.id)
            }
            return null;
        }
        messageString = `${targetPlayer.displayName} successfully registered to <@${userID}>!\nUnlinked from ${verDoc.username}.`
        verDoc.username = username
        verDoc.save()
    } else { // If user wasn't verified previously, create a new verification document, with no cooldown
        await verificationModel.create({
            userID: userID,
            username: username
        })
        messageString = `${playerDoc.displayName} successfully registered to <@${userID}>!`
    }






    if (channelID !== undefined && messageString !== '') {
        const basicEmbed = require('../functions_discord/basicEmbed');
        basicEmbed(channelID, 'Verification Manager', messageString);
    }
}