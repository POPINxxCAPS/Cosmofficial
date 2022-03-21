const getAllSettings = require("../database/getAllSettings");

module.exports = async (guildID, settings) => {
    if(settings === undefined) {
        settings = await getAllSettings(guildID);
    }
    const hoover = settings.find(set => set.name === 'hoover')
    let hooverSettings = {};
    try { // .find() Causes crashes, so I need to do it this way.
        hooverSettings.enabled = hoover.settings.find(set => set.setting === 'enabled').value;
        hooverSettings.scanInterval = hoover.settings.find(set => set.setting === 'scaninterval').value;
        hooverSettings.sweepDelay = hoover.settings.find(set => set.setting === 'sweepdelay').value;
        hooverSettings.unpoweredGrids = hoover.settings.find(set => set.setting === 'unpoweredgrids').value;
        hooverSettings.largeGrids = hoover.settings.find(set => set.setting === 'largegrids').value;
        hooverSettings.smallGrids = hoover.settings.find(set => set.setting === 'smallgrids').value;
        hooverSettings.blockThreshold = hoover.settings.find(set => set.setting === 'blockthreshold').value;
        hooverSettings.maxSpeed = hoover.settings.find(set => set.setting === 'maxspeed').value;
        hooverSettings.worldBorder = hoover.settings.find(set => set.setting === 'worldborder').value;
        hooverSettings.unverifiedRemoval = hoover.settings.find(set => set.setting === 'unverifiedremoval').value;
    } catch (err) {
        console.log(`There was an error making the hooverSettings var for guildID ${guildID}.`)
        return null;
    }
    return hooverSettings;
}