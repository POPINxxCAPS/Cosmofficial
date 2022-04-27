const settingsModel = require('../../models/settingSchema');


module.exports = async (guildID) => {
    if(guildID === undefined) return;
    let settings = [];
    let description; // Placeholder var
    let enabled = await settingsModel.findOne({
        guildID: guildID,
        category: 'hoover',
        setting: 'enabled'
    })
    if (enabled === null) {
        enabled = await settingsModel.create({
            guildID: guildID,
            displayName: 'Enabled',
            category: 'hoover',
            description: 'Is the hoover running?',
            setting: 'enabled',
            value: 'Not Set',
            valueType: 'boolean'
        })
    }
    settings.push(enabled);

    let scanInterval = await settingsModel.findOne({
        guildID: guildID,
        category: 'hoover',
        setting: 'scaninterval'
    })
    description = 'Frequency at which the bot scans grids for deletion.\nApplies a delay (if set) before grids are deleted.\nHighly recommended, otherwise the bot is ruthless.'
    if (scanInterval === null) {
        scanInterval = await settingsModel.create({
            guildID: guildID,
            displayName: 'Scan Interval',
            category: 'hoover',
            description: description,
            setting: 'scaninterval',
            value: 'Not Set',
            valueType: 'time'
        })
    }
    scanInterval.save();

    settings.push(scanInterval);

    let sweepDelay = await settingsModel.findOne({
        guildID: guildID,
        category: 'hoover',
        setting: 'sweepdelay'
    })
    if (sweepDelay === null) {
        sweepDelay = await settingsModel.create({
            guildID: guildID,
            displayName: 'Sweep Delay',
            category: 'hoover',
            description: 'Amount of time to delay a grid from getting deleted after being flagged.',
            setting: 'sweepdelay',
            value: 'Not Set',
            valueType: 'time'
        })
    }
    settings.push(sweepDelay);

    let unpoweredGrids = await settingsModel.findOne({
        guildID: guildID,
        category: 'hoover',
        setting: 'unpoweredgrids'
    })
    if (unpoweredGrids === null) {
        unpoweredGrids = await settingsModel.create({
            guildID: guildID,
            displayName: 'Unpowered Grid Removal',
            category: 'hoover',
            description: 'Clean unpowered grids?',
            setting: 'unpoweredgrids',
            value: 'Not Set',
            valueType: 'boolean'
        })
    }
    settings.push(unpoweredGrids);

    let largeGrids = await settingsModel.findOne({
        guildID: guildID,
        category: 'hoover',
        setting: 'largegrids'
    })
    if (largeGrids === null) {
        largeGrids = await settingsModel.create({
            guildID: guildID,
            displayName: 'Large Grid Removal',
            category: 'hoover',
            description: 'Delete *all* large grids?',
            setting: 'largegrids',
            value: 'Not Set',
            valueType: 'boolean'
        })
    }
    settings.push(largeGrids);

    let smallGrids = await settingsModel.findOne({
        guildID: guildID,
        category: 'hoover',
        setting: 'smallgrids'
    })
    if (smallGrids === null) {
        smallGrids = await settingsModel.create({
            guildID: guildID,
            displayName: 'Small Grid Removal',
            category: 'hoover',
            description: 'Delete *all* small grids?',
            setting: 'smallgrids',
            value: 'Not Set',
            valueType: 'boolean'
        })
    }
    settings.push(smallGrids);

    let blockThreshold = await settingsModel.findOne({
        guildID: guildID,
        category: 'hoover',
        setting: 'blockthreshold'
    })
    if (blockThreshold === null) {
        blockThreshold = await settingsModel.create({
            guildID: guildID,
            displayName: 'Block Threshold',
            category: 'hoover',
            description: 'Delete all grids under X amount of blocks.',
            setting: 'blockthreshold',
            value: 'Not Set',
            valueType: 'number'
        })
    }
    settings.push(blockThreshold);

    let maxSpeed = await settingsModel.findOne({
        guildID: guildID,
        category: 'hoover',
        setting: 'maxspeed'
    })
    if (maxSpeed === null) {
        maxSpeed = await settingsModel.create({
            guildID: guildID,
            displayName: 'Max Ship Speed',
            category: 'hoover',
            description: 'Delete any grids over this speed limit.\nUseful for exploit prevention and performance!\nNote: This is almost instant. 20% lenience rate.\nEx: At max speed of 100, bot will delete anything over 120.',
            setting: 'maxspeed',
            value: 'Not Set',
            valueType: 'number'
        })
    }
    settings.push(maxSpeed);

    let worldBorder = await settingsModel.findOne({
        guildID: guildID,
        category: 'hoover',
        setting: 'worldborder'
    })
    if (worldBorder === null) {
        worldBorder = await settingsModel.create({
            guildID: guildID,
            displayName: 'World Border (km)',
            category: 'hoover',
            description: 'Delete any grids outside of world boundaries. Radius in Km from x0 y0 z0.\nNote: This is almost instant.',
            setting: 'worldborder',
            value: 'Not Set',
            valueType: 'number'
        })
    }
    settings.push(worldBorder);

    let unverifiedRemoval = await settingsModel.findOne({
        guildID: guildID,
        category: 'hoover',
        setting: 'unverifiedremoval'
    })
    if (unverifiedRemoval === null) {
        unverifiedRemoval = await settingsModel.create({
            guildID: guildID,
            displayName: 'Unverified Removal',
            category: 'hoover',
            description: 'Deletes grids of players that have not completed c!verify.\nThis helps deter alt accounts by forcing a discord-link.\nAlso deletes grids of players that leave your discord.',
            setting: 'unverifiedremoval',
            value: 'Not Set',
            valueType: 'boolean'
        })
    }
    settings.push(unverifiedRemoval);

    return settings
}