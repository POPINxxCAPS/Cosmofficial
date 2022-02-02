const hooverSettingModel = require('../models/hooverSettingSchema');
const ms = require('ms');
module.exports = async (client) =>{
    const guild = client.guilds.cache.get('799685703910686720');
    const channel = guild.channels.cache.get('892474602259882044');

    setInterval(async () =>{
        let current_time = Date.now()
        let setting = await hooverSettingModel.findOne({
            guildID: guild.id
        })
        let time = ms((parseInt(setting.nextCleanup) - current_time), { long: true })
        console.log('Updating cleanup time.')
        channel.setName(`Next Cleanup: ${time}`);
    }, 120000);
}