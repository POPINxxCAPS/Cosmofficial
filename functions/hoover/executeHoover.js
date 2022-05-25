const gridDelete = require('../execution/gridDelete');
const makeHooverSettingVar = require('../misc/makeHooverSettingVar');
const botStatModel = require('../../models/botStatisticSchema');
module.exports = async (req) => {
    const gridDocsCache = req.gridDocsCache;
    const guildID = req.guildID;
    if (gridDocsCache === undefined) throw 'gridDocsCache is not defined.';
    if (guildID === undefined) throw 'guildID is not defined.';
    const settings = req.settings;
    const hooverSettings = await makeHooverSettingVar(guildID, settings);
    if (hooverSettings === null || hooverSettings === undefined) return gridDocsCache;
    if (hooverSettings.enabled === 'Not Set' || hooverSettings.enabled === 'false') return gridDocsCache;
    const current_time = Date.now();
    let botStatDoc = await botStatModel.findOne({
        name: 'deletedByHoover'
    })
    if(botStatDoc === null) {
        botStatDoc = await botStatModel.create({
            name: 'deletedByHoover',
            value: '0'
        })
    }


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
            gridDocsCache.splice(index, 1);
            try {
                gridDoc.remove();
            } catch(err) {}
        }
    }
    try {
        botStatDoc.save().then().catch(err => {});
    } catch(err) {}
    return gridDocsCache;
}