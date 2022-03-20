const discord = require('discord.js')
module.exports = async (channel, errorString) => {
    const embed = new discord.MessageEmbed()
        .setColor('#E02A6B')
        .setTitle('An Error Occurred')
        .setURL('https://github.com/POPINxxCAPS/Cosmofficial/issues')
        .setDescription(errorString)
        .setFooter('Cosmofficial by POPINxxCAPS');
    return channel.send(embed)
}