const ms = require('ms');
module.exports = async (channel, discord, cooldown, command, userID) => {
    const embed = new discord.MessageEmbed()
        .setColor('#E02A6B')
        .setTitle('Cooldown Manager')
        .setURL('https://www.patreon.com/Cosmofficial')
        .setDescription(`<@${userID}>\n${command} is currently on cooldown.\nTime Remaining: ${ms(cooldown)}`)
        .setFooter('Cosmofficial by POPINxxCAPS');
    return channel.send(embed)
}