const ms = require('ms');
const discord = require('discord.js')
module.exports = async (channel, cooldown, command, userID) => {
    const embed = new discord.MessageEmbed()
        .setColor('#E02A6B')
        .setTitle('Cooldown Manager')
        .setURL('https://cosmofficial.herokuapp.com/')
        .setDescription(`<@${userID}>\n${command} is currently on cooldown.\nTime Remaining: ${ms(cooldown)}`)
        .setFooter('Cosmofficial by POPINxxCAPS');
    return channel.send(embed)
}