module.exports = async (channel, discord) => {
    const embed = new discord.MessageEmbed()
        .setColor('#E02A6B')
        .setTitle('Feature Locked')
        .setURL('https://cosmofficial.herokuapp.com/')
        .setDescription('The discord owner must be subscribed to the Patreon.\nFeature is currently locked.')
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