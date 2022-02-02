const playerEcoModel = require('../models/playerEcoSchema');
const playerDoc = require('../models/playerSchema');
const verificationModel = require('../models/verificationSchema');
const characterModel = require('../models/verificationSchema');

let acceptedNPCGridNames = [];

let rewards = [{
    name: '(NPC-ATM) SS-1 Serenity MK.2',
    reward: 10000,
}]

module.exports = async (guildID, client, gridDoc) => {
    for(let i = 0; i < rewards.length; i++) {
        acceptedNPCGridNames.push(rewards[i].name)
    }

    if(acceptedNPCGridNames.includes(gridDoc.displayName) === false) return;

    const charDoc = await characterModel.findOne({
        guildID: guildID,
        name: gridDoc.ownerDisplayName
    })
    if(charDoc === null) return;

    const verDoc = await verificationModel.findOne({
        guildID: guildID,
        username: gridDoc.ownerDisplayName
    })
    if(verDoc === null) return;

    const playerDoc = await playerModel.findOne({
        guildID: guildID,
        displayName: gridDoc.ownerDisplayName
    })
    if(playerDoc === null) return;

    let playerEcoDoc = await playerEcoModel.findOne({
        guildID: guildID,
        userID: verDoc.userID
    })
    if(playerEcoDoc === null) return;


    for(let i = 0; i < rewards.length; i++) {
        if(rewards[i].name === gridDoc.displayName) { // 
            let reward = rewards[i].reward;
            let gridName = rewards[i].name;
            



            break
        }
    }
}