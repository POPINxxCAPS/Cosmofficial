module.exports = async (channel, discord) => {
    const embed = new discord.MessageEmbed()
        .setColor('#E02A6B')
        .setTitle('Feature Locked')
        .setURL('https://cosmofficial.herokuapp.com/')
        .setDescription('This is a patron only feature. The owner of the discord must be a patron to use this. Please consider supporting future development of the bot to unlock everything available.')
        .addFields({
            name: 'Patreon Link',
            value: `c!patreon`
        }, {
            name: 'Cosmofficial discord Link',
            value: 'c!invite'
        })
        .setFooter('Cosmofficial by POPINxxCAPS');
    return channel.send(embed)
}