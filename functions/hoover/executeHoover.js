const gridDelete = require('../execution/gridDelete');
const makeHooverSettingVar = require('../misc/makeHooverSettingVar');
const botStatModel = require('../../models/botStatisticSchema');
const {
    MessageEmbed
} = require('discord.js');
module.exports = async (req) => {
    const gridDocsCache = req.gridDocsCache;
    const guildID = req.guildID;
    const client = req.client;
    const discord = req.discord;
    const guild = client.guilds.cache.get(guildID);

    if (gridDocsCache === undefined) throw 'gridDocsCache is not defined.';
    if (guildID === undefined) throw 'guildID is not defined.';
    const settings = req.settings;
    const hooverSettings = await makeHooverSettingVar(guildID, settings);
    const hooverLogChannel = guild.channels.cache.get(hooverSettings.hooverLog);
    if (hooverSettings === null || hooverSettings === undefined) return gridDocsCache;
    if (hooverSettings.enabled === 'Not Set' || hooverSettings.enabled === 'false') return gridDocsCache;
    const current_time = Date.now();
    let botStatDoc = await botStatModel.findOne({
        name: 'deletedByHoover'
    })
    if (botStatDoc === null) {
        botStatDoc = await botStatModel.create({
            name: 'deletedByHoover',
            value: '0'
        })
    }

    let deletedGridStrings = [''];
    let deletedObjs = [];
    let stringCount = 0;
    for (const gridDoc of gridDocsCache) {
        const index = gridDocsCache.indexOf(gridDoc);
        if (gridDoc === null) {
            gridDocsCache.splice(index, 1);
            console.log('gridDocCache null error fixed')
            continue;
        }
        if (gridDoc.deletionTime < current_time && gridDoc.queuedForDeletion === true) {
            await gridDelete(guildID, gridDoc.entityID);
            botStatDoc.value = parseInt(botStatDoc.value) + 1;
            console.log(`Hoover swept ${gridDoc.displayName}`)
            let userObj = await deletedObjs.find(obj => obj.username === gridDoc.ownerDisplayName)
            if (userObj === undefined) {
                userObj = {
                    username: gridDoc.ownerDisplayName,
                    grids: [gridDoc]
                }
                deletedObjs.push(userObj);
            } else {
                const index = deletedObjs.indexOf(userObj);
                userObj.grids.push(gridDoc);
                deletedObjs[index] = userObj;
            }
            /*if (deletedGridStrings[stringCount].length > 900) {
                stringCount += 1;
                deletedGridStrings[stringCount] = '';
            }
            deletedGridStrings[stringCount] += `${gridDoc.displayName} ${gridDoc.deletionReason}\n`;*/
            gridDocsCache.splice(index, 1);
            try {
                gridDoc.remove();
            } catch (err) {}
        }
    }

    const embed = new discord.MessageEmbed()
        .setColor('#E02A6B')
        .setTitle(`Hoover Log`)
        .setURL('https://cosmofficial.herokuapp.com/')
        .setFooter('Cosmofficial by POPINxxCAPS')
    for (const userObj of deletedObjs) {
        const username = userObj.username === '' ? "No Owner" : userObj.username;
        let string = '';
        for (const gridDoc of userObj.grids) {
            string += `${gridDoc.displayName} ${gridDoc.deletionReason}\n`
        }
        if (string === '') continue;
        embed.addFields({
            name: `${username}`,
            value: string
        })
    }
    if (hooverLogChannel !== undefined && hooverLogChannel !== null && deletedObjs.length !== 0) {
        try {
            hooverLogChannel.send(embed);
        } catch (err) {}
    }
    /*for (const string of deletedGridStrings) {
        if (string === '') continue;
        const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle(`Hoover Log`)
            .setURL('https://cosmofficial.herokuapp.com/')
            .setFooter('Cosmofficial by POPINxxCAPS')
            .addFields({
                name: 'Deleted Grids',
                value: string
            });
        if (hooverLogChannel !== undefined && hooverLogChannel !== null) {
            try {
                hooverLogChannel.send(embed);
            } catch (err) {}
        }
    }*/
    try {
        botStatDoc.save().then().catch(err => {});
    } catch (err) {}
    return gridDocsCache;
}