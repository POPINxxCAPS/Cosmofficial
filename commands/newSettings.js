const getAllSettings = require('../functions_db/getAllSettings.js'); 
module.exports = {
    name: 'newsettings',
    aliases: ['ns'],
    description: "Edit bot settings. This includes events, economy settings, channel tickers, and more.",
    permissions: ["ADMINISTRATOR"],
    async execute(req) {
        const message = req.message;
        const guild = req.guild;
        let settings = await getAllSettings(guild.id);
        console.log(settings)
    }
}