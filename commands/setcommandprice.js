const lockedEmbed = require('../functions_discord/lockedEmbed');
const errorEmbed = require('../functions_discord/errorEmbed');
const commandPriceModel = require('../models/commandPriceSchema');

const validCommandNames = ['emp'];
module.exports = {
    name: 'setcommandprice',
    aliases: ['scp'],
    description: "Set the price for a command",
    permissions: ["SEND_MESSAGES"],
    async execute(message, args, cmd, client, discord, mainGuild, guild, playerEco) {
        let guildOwner = mainGuild.members.cache.get(message.guild.owner.user.id);
        if (!guildOwner || guildOwner === null || guildOwner === undefined) return message.channel.send('The owner of this discord must be in the Cosmofficial discord to enable usage of this command.');
        let patron = false;
        if (guildOwner.roles.cache.has('883535930630213653') || guildOwner.roles.cache.has('883564396587147275')) {
            patron = true;
        }
        if (patron === false) return lockedEmbed(message.channel, discord);

        if(args[0] === undefined) return errorEmbed(message.channel, 'Invalid argument *one*\nPlease enter a command name to set the price.')
        if(validCommandNames.includes(args[0]) === false) {
            let validString = '';
            for(let i = 0; i < validCommandNames.length; i++) {
                validString += `${validCommandNames[i]}\n`
            }
            return errorEmbed(message.channel, `Command name not valid to set a price.\nValid: ${validString}`)
        } 
        let commandName = args[0];
        let price = parseInt(args[1])
    
        if (price % 1 != 0 || price <= 0) return errorEmbed(message.channel, 'Invalid argument *two*\nPlease enter a whole number as a price for the command.')

        let priceDoc = await commandPriceModel.findOne({
            guildID: message.guild.id,
            commandName: commandName,
        })
        if(priceDoc === null) {
            priceDoc = await commandPriceModel.create({
                guildID: message.guild.id,
                commandName: commandName,
                price: price
            })
        } else {
            priceDoc.price = price
            priceDoc.save();
        }
        const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle('Command Price')
            .setURL('https://www.patreon.com/Cosmofficial')
            .setDescription(`The price for the ${commandName} command has been set to ${price} successfully.`)
            .setFooter('Cosmobot by POPINxxCAPS');
        
        try { 
            message.channel.send(embed)
        } catch(err) {}
    }
}