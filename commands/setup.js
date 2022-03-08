const remoteConfigModel = require('../models/remoteConfigSchema');
 
module.exports = {
    name: 'setup',
    aliases: ['setup'],
    description: "Attempt to create a setup config file",
    permissions: ["ADMINISTRATOR"],
    async execute(req) {
        const message = req.message;
        const args = req.args;
        const guild = req.guild;
        let configCheck = await remoteConfigModel.findOne({guildID: guild.id}) // Check if config already created, if true, return message to channel
        if(configCheck !== null) return message.channel.send('This discord already has a sever registered.\nUse (c!crs) c!checkremotesetup to view your current settings.\nUse c!editremotesetup <item> <newValue> to change your settings.');
        
        /*let sender = mainGuild.members.cache.get(message.author.id);
        if(!sender) return message.channel.send('You must be in the Cosmofficial discord to use this command.');
        if(!(sender.roles.cache.has('854211115915149342'))) return message.channel.send('You must be a patron to use this command.');*/

        if(!args[0]) return message.channel.send('Remote IP is required in argument one.');
        if(!args[1]) return message.channel.send('Remote Port is required in argument two.');
        if(!args[2]) return message.channel.send('Remote Secret is required in argument three.');

        let config = await remoteConfigModel.create({
            baseURL: `http://${args[0]}`,
            port: args[1],
            prefix: '/vrageremote',
            secret: args[2],
            guildID: guild.id
        })
        config.save();
        message.channel.send('Setup configuration completed.\nUse c!checkremotesetup (or c!crs) to view your current settings.\nUse (c!ers) c!editremotesetup <item> <newValue> to change your settings.')
    }
}