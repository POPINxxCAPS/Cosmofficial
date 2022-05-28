const playerModel = require('../../models/playerSchema');
const verificationModel = require('../../models/verificationSchema');
const errorEmbed = require('../../functions/discord/errorEmbed');
const cooldownFunction = require('../../functions/database/cooldownFunction');
const cooldownEmbed = require('../../functions/discord/cooldownEmbed');
const discord = require('discord.js')

module.exports = async (username, userID, channel) => {
    let cancel = false;
    let messageString = '';

    console.log(`Attempting to link ${userID} with ${username} using verify`)

    const playerDoc = await playerModel.findOne({
        displayName: username,
    })
    if (playerDoc === null) {
        if (channel !== undefined) {
            errorEmbed(channel, 'Username was not found in the database.\nHave you logged into a server running Cosmofficial?\nIf you are having trouble, use c!players while logged in to see the username reported by Space Engineers.');
        }
        return null;
    }


    let verDoc = await verificationModel.findOne({
        username: username
    })
    if (verDoc !== null) {
        if (channel !== undefined) {
            if (verDoc.userID === userID) {
                errorEmbed(channel, `${username} is already registered to you!`)
            } else {
                errorEmbed(channel, `${username} is already registered to a user!`)
            }
        }
        return null;
    }


    verDoc = await verificationModel.findOne({
        userID: userID
    })
    if (verDoc !== null) { // If user was already verified previously, set a cooldown and change their verified username
        const cooldown = await cooldownFunction.cd('development', 259200, message);
        if (cooldown !== undefined) {
            if (channel !== undefined) {
                cooldownEmbed(channel, cooldown, 'Timely', message.author.id)
            }
            return null;
        }
        messageString = `${playerDoc.displayName} successfully registered to <@${userID}>!\nUnlinked from ${verDoc.username}.`
        verDoc.username = username
        verDoc.save()
    } else { // If user wasn't verified previously, create a new verification document, with no cooldown
        await verificationModel.create({
            userID: userID,
            username: username
        })
        messageString = `${playerDoc.displayName} successfully registered to <@${userID}>!`
    }






    if (channel !== undefined && messageString !== '') {
        const basicEmbed = require('../discord/basicEmbed');
        basicEmbed(channel, 'Verification Manager', messageString);
    }
}