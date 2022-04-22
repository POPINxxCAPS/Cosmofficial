const playerModel = require('../../models/playerSchema')
const playerEcoModel = require('../../models/playerEcoSchema')
const timerFunction = require('../../functions/database/timerFunction');
const hotzoneLocationModel = require('../../models/hotzoneLocationSchema');
const temporaryStatModel = require('../../models/temporaryStatSchema');
const makeHotzoneSettingVar = require('../../functions/misc/makeHotzoneSettingVar');
const makeChannelSettingVar = require('../../functions/misc/makeChannelSettingVar');
const getNearbyGrids = require('../information/getNearbyGrids')
const getNearbyCharacters = require('../information/getNearbyCharacters')
const ms = require('ms');
const rewardFaction = require('../misc/rewardFaction');

module.exports = async (req) => {
    const discord = req.discord;
    const client = req.client;
    const guildID = req.guildID;
    const gridDocCache = req.gridDocsCache;
    const settings = req.settings;
    const verificationCache = req.verDocs;
    req.expirationInSeconds = (req.gridQueryDelay / 3) / 1000 || 30;
    if (req.expirationInSeconds < 30) req.expirationInSeconds = 30;
    req.name = 'hotzone'
    const timerCheck = await timerFunction(req)
    //if (timerCheck === true) return; // If there is a timer, cancel.
    const hotzoneSettings = await makeHotzoneSettingVar(guildID, settings);
    if (hotzoneSettings.enabled !== 'true') return gridDocCache;
    const interval = hotzoneSettings.interval === "Not Set" ? (3600000 * 2) : parseInt(hotzoneSettings.interval);
    const timer = hotzoneSettings.timer === "Not Set" ? 3600000 : parseInt(hotzoneSettings.timer);
    const reward = hotzoneSettings.reward === "Not Set" ? 75 : parseInt(hotzoneSettings.reward);
    const bonus = hotzoneSettings.bonus === "Not Set" ? 1000000 : parseInt(hotzoneSettings.bonus);
    const radius = hotzoneSettings.radius === "Not Set" ? 1000 : parseInt(hotzoneSettings.radius);
    const range = hotzoneSettings.range === "Not Set" ? 1000000 : parseInt(hotzoneSettings.range);
    // Display to discord channel
    const channelSettings = await makeChannelSettingVar(guildID, settings)
    const channel = client.channels.cache.get(channelSettings.hotzone);

    let location = await hotzoneLocationModel.findOne({
        guildID: guildID
    })
    let randomX = Math.floor(Math.random() * (range / 3)) + 1;
    randomX *= Math.round(Math.random()) ? 1 : -1;
    let randomY = Math.floor(Math.random() * (range / 3)) + 1;
    randomY *= Math.round(Math.random()) ? 1 : -1;
    let randomZ = Math.floor(Math.random() * (range / 3)) + 1;
    randomZ *= Math.round(Math.random()) ? 1 : -1;
    if (location === null) {
        location = await hotzoneLocationModel.create({
            guildID: guildID,
            x: randomX,
            y: randomY,
            z: randomZ,
            expirationTime: Date.now() + timer
        })
    }

    if (location.expirationTime < Date.now()) { // If location's timer has ended
        if ((parseInt(location.expirationTime) + interval) - Date.now() < 0) { // Time to start new game?
            location.expirationTime = Date.now() + timer;
            location.x = randomX;
            location.y = randomY;
            location.z = randomZ;
            location.save();
            return; // Just return if the gamemode has started, run the display on next query
        }
        // Reward Faction with bonus (if applicable)
        let statDocs = await temporaryStatModel.find({
            guildID: guildID,
            name: 'HotzoneTime'
        })
        if (statDocs.length !== 0) {
            statDocs = statDocs.sort((a, b) => ((a) > (b)) ? -1 : 1);
            rewardFaction(guildID, statDocs[0].factionTag, bonus)
        } // Doing it this way will prevent multiple rewards from being sent while the zone is down


        // Reset all temporary stats
        let ecoStatDocs = await temporaryStatModel.find({
            guildID: guildID,
            name: 'HotzoneReward'
        })
        statDocs.forEach(doc => doc.remove());
        ecoStatDocs.forEach(doc => doc.remove());

        // Return a "waiting for next zone embed"
        const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle(`Hotzone`)
            .setURL('https://cosmofficial.herokuapp.com/')
            .setFooter('Cosmofficial by POPINxxCAPS')
            .setDescription(`Awaiting next zone.\n${ms(((parseInt(location.expirationTime) + interval) - Date.now()))} until next zone spawns.`)

        try {
            if (channel === undefined || channel === null) return; // If channel doesn't exist, no need to try to display anything.
            channel.bulkDelete(2)
            channel.send(embed)
        } catch (err) {}
        return; // Unfinished
    }


    // Get all grids within range of hotzone
    const nearbyChars = await getNearbyCharacters(guildID, radius, location.x, location.y, location.z);
    const nearbyGrids = await getNearbyGrids(client, guildID, radius, location.x, location.y, location.z);

    // Get all faction tags within zone + reward players in zone
    let factionsInZone = [];
    let ecoStatCache = [];
    let timeStatCache = [];
    const rewardAmount = (reward * req.expirationInSeconds);

    let characterString = '**__Characters__**\n'
    for (const character of nearbyChars) {
        const playerDoc = await playerModel.findOne({
            guildID: guildID,
            displayName: character.name
        })
        characterString += `> [${playerDoc.factionTag}] ${character.name}`;
        if (playerDoc === null) continue;
        let factionEcoStatDoc = ecoStatCache.find(doc => doc.factionTag === playerDoc.factionTag) || await temporaryStatModel.findOne({
            guildID: guildID,
            factionTag: playerDoc.factionTag,
            name: 'HotzoneReward'
        })
        if (factionEcoStatDoc === undefined || factionEcoStatDoc === null) {
            factionEcoStatDoc = await temporaryStatModel.create({
                guildID: guildID,
                factionTag: playerDoc.factionTag,
                name: 'HotzoneReward',
                value: rewardAmount / nearbyChars.length
            })
            ecoStatCache.push(factionEcoStatDoc)
        } else {
            const cacheIndex = ecoStatCache.indexOf(factionEcoStatDoc);
            factionEcoStatDoc.value = parseInt(factionEcoStatDoc.value) + (req.expirationInSeconds * 1000);
            if (cacheIndex === -1) {
                ecoStatCache.push(factionEcoStatDoc);
            } else ecoStatCache[cacheIndex] = factionEcoStatDoc;
        }
        let factionTimeStatDoc = timeStatCache.find(doc => doc.factionTag === playerDoc.factionTag) || await temporaryStatModel.findOne({
            guildID: guildID,
            factionTag: playerDoc.factionTag,
            name: 'HotzoneTime'
        })
        if (factionTimeStatDoc === undefined || factionTimeStatDoc === null) {
            factionTimeStatDoc = await temporaryStatModel.create({
                guildID: guildID,
                factionTag: playerDoc.factionTag,
                name: 'HotzoneTime',
                value: (req.expirationInSeconds * 1000) / nearbyChars.length
            })
            timeStatCache.push(factionTimeStatDoc)
        } else {
            const cacheIndex = timeStatCache.indexOf(factionTimeStatDoc);
            factionTimeStatDoc.value = parseInt(factionTimeStatDoc.value) + (req.expirationInSeconds * 1000);
            if (cacheIndex === -1) {
                timeStatCache.push(factionTimeStatDoc);
            } else timeStatCache[cacheIndex] = factionTimeStatDoc;
        }


        const verDoc = verificationCache.find(doc => doc.username === character.name);
        if (verDoc !== undefined) { // If they are verified, reward them
            let playerEcoDoc = await playerEcoModel.findOne({
                guildID: guildID,
                userID: verDoc.userID
            })
            let statFound = false;
            for (let s = 0; s < playerEcoDoc.statistics.length; s++) {
                if (playerEcoDoc.statistics[s].name === 'HotzoneRewardReceived') {
                    playerEcoDoc.statistics[s].value = Number(playerEcoDoc.statistics[s].value) + rewardAmount;
                    statFound = true;
                }
            }
            if (statFound === false) {
                playerEcoDoc.statistics.push({
                    name: 'HotzoneRewardReceived',
                    value: `${rewardAmount}` // overwatch procrastination
                })
            }
            playerEcoDoc.currency = (parseInt(playerEcoDoc.currency) + rewardAmount) / nearbyChars.length; // Multiply reward * query delay / characters to reward
            playerEcoDoc.save();
        }


        if (factionsInZone.includes(playerDoc.factionTag) === true) continue;
        factionsInZone.push(playerDoc.factionTag);
    }

    // Save all cached temporary stat documents
    ecoStatCache.forEach(doc => {
        doc.save()
    })
    timeStatCache.forEach(doc => {
        doc.save()
    })

    if (channel === undefined || channel === null) return; // If channel doesn't exist, no need to try to display anything.

    let factionDataStrings = [];
    ecoStatCache = await temporaryStatModel.find({
        guildID: guildID,
        name: 'HotzoneReward'
    })
    for (const ecoStat of ecoStatCache) {
        const timeStat = await temporaryStatModel.findOne({
            guildID: guildID,
            factionTag: ecoStat.factionTag,
            name: 'HotzoneTime'
        })
        if (ecoStat === undefined || timeStat === undefined) continue;
        factionDataStrings.push(`[${ecoStat.factionTag}] Time: ${ms(parseInt(timeStat.value))} Reward: ${ecoStat.value}`);
    }

    factionDataStrings = factionDataStrings.sort((a, b) => ((a) > (b)) ? 1 : -1);
    let scoreString = '**__Top Scores__**\n';
    for (const string of factionDataStrings) {
        scoreString += `${string}\n`
    }

    let gridString = '**__Grids__**\n'
    for (const grid of nearbyGrids) {
        gridString += `> [${grid.factionTag}] ${grid.displayName}`
    }

    const embed = new discord.MessageEmbed()
        .setColor('#E02A6B')
        .setTitle(`Hotzone`)
        .setURL('https://cosmofficial.herokuapp.com/')
        .setFooter('Cosmofficial by POPINxxCAPS')
        .setDescription(`**__Position:__**\n> X: ${location.x}\n> Y: ${location.y}\n> Z: ${location.z}\n\n${scoreString}\n\n${characterString}\n\n${gridString}\n\nTime Remaining: ${ms((location.expirationTime - Date.now()))}`);

    try {
        channel.bulkDelete(2);
        channel.send(embed);
    } catch (err) {}
}