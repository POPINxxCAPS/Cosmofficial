const remoteConfigModel = require('../models/remoteConfigSchema');
 
module.exports = {
    name: 'checkremotesetup',
    aliases: ['crs'],
    description: "View this discord's setup file",
    permissions: ["ADMINISTRATOR"],
    async execute(req) {
        const message = req.message;
        const guild = req.guild;
        let configCheck = await remoteConfigModel.findOne({guildID: guild.id}) // Check if config already created, if true, return message to channel
        if(configCheck === null) return message.channel.send('This discord does not have a server registered.\nUse c!setup to add your remote configuration.');
        
        /*let sender = mainGuild.members.cache.get(message.author.id);
        if(!sender) return message.channel.send('You must be in the Cosmofficial discord to use this command.');
        if(!(sender.roles.cache.has('854211115915149342'))) return message.channel.send('You must be a patron to use this command.');*/

        let config = await remoteConfigModel.findOne({
            guildID: guild.id
        })
        message.channel.send(`Your current remote configuration:\nServer Address - ${config.baseURL}\nPort - ${config.port}\nSecret - ${config.secret}`)
    }
}