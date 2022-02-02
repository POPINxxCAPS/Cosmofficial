const remoteConfigModel = require('../models/remoteConfigSchema');
 
module.exports = {
    name: 'editremotesetup',
    aliases: ['ers'],
    description: "Edit this discord's setup file",
    permissions: ["ADMINISTRATOR"],
    async execute(message, args, cmd, client, discord, mainGuild, guild) {
        let configCheck = await remoteConfigModel.findOne({guildID: guild.id}) // Check if config already created, if true, return message to channel
        if(configCheck === null) return message.channel.send('This discord does not have a server registered.\nUse c!setup to add your remote configuration.');
        
        /*let sender = mainGuild.members.cache.get(message.author.id);
        if(!sender) return message.channel.send('You must be in the Cosmofficial discord to use this command.');
        if(!(sender.roles.cache.has('854211115915149342'))) return message.channel.send('You must be a patron to use this command.'); */
        if(!args[0]) return message.channel.send('Argument one is required. Valid arguments: port, secret, ip')
        if((args[0] !== 'port') && (args[0] !== 'secret') && (args[0] !== 'ip')) return message.channel.send('Invalid argument one. Valid arguments are: port, secret, ip');
        if(!args[1]) return message.channel.send(`Please specify a value to set as the ${args[0]} in argument two.`)
        if(args[0] === 'port') {
            await remoteConfigModel.findOneAndUpdate({guildID: guild.id}, {port: args[1]})
        }
        if(args[0] === 'secret') {
            await remoteConfigModel.findOneAndUpdate({guildID: guild.id}, {secret: args[1]})
        }
        if(args[0] === 'ip') {
            await remoteConfigModel.findOneAndUpdate({guildID: guild.id}, {baseURL: `http://${args[1]}`})
        }

        message.channel.send(`Successfully changed the ${args[0]}.`)
    }
}