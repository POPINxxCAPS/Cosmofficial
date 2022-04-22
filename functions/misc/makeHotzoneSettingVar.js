const getAllSettings = require("../database/getAllSettings");

module.exports = async (guildID, settings) => {
    if(settings === undefined) {
        settings = await getAllSettings(guildID);
    }
    const hotzone = settings.find(set => set.name === 'hotzone');
    let hotzoneSettings = {};
    try { // .find() Causes crashes, so I need to do it this way.
        hotzoneSettings.enabled = hotzone.settings.find(set => set.setting === 'enabled').value;
        hotzoneSettings.interval = hotzone.settings.find(set => set.setting === 'interval').value;
        hotzoneSettings.timer = hotzone.settings.find(set => set.setting === 'timer').value;
        hotzoneSettings.reward = hotzone.settings.find(set => set.setting === 'reward').value;
        hotzoneSettings.bonus = hotzone.settings.find(set => set.setting === 'bonus').value;
        hotzoneSettings.radius = hotzone.settings.find(set => set.setting === 'radius').value;
        hotzoneSettings.range = hotzone.settings.find(set => set.setting === 'range').value;
    } catch (err) {
        console.log(`There was an error making the hotzone var for guildID ${guildID}.`)
        return null;
    }
    return hotzoneSettings;
}