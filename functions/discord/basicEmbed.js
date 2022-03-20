const discord = require('discord.js')
module.exports = async (channel, title, description) => {
    if(title === undefined) title = 'Not Set'
    if(description === undefined) description = 'Not Set'
    const embed = new discord.MessageEmbed()
        .setColor('#E02A6B')
        .setTitle(title)
        .setDescription(description)
        .setURL('https://cosmofficial.herokuapp.com/')
        .setFooter('Cosmobot by POPINxxCAPS');
    return channel.send(embed)
}