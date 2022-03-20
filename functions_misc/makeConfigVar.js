const getAllSettings = require("../functions_db/getAllSettings");

module.exports = async (guildID, settings) => {
    if(settings === undefined) {
        settings = await getAllSettings(guildID);
    }
    const remote = settings.find(set => set.name === 'remote');
    let config = {};
    try { // .find() Causes crashes, so I need to do it this way.
        config.ip = `http://${remote.settings.find(set => set.setting === 'ip').value}`;
        config.port = remote.settings.find(set => set.setting === 'port').value;
        config.secret = remote.settings.find(set => set.setting === 'secret').value;
        config.prefix = '/vrageremote';
    } catch (err) {
        console.log(`There was an error making the config var for guildID ${guildID}.`)
        return null;
    }
    return config;
}