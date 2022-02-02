
module.exports = {
    name: 'invite',
    aliases: ['invite'],
    description: "List server chat messages",
    permissions: ["SEND_MESSAGES"],
    async execute(message, args, cmd, client, discord, mainGuild, guild, playerEco) {
        const embed =  new discord.MessageEmbed()
        .setColor('#E02A6B')
        .setTitle(`Cosmofficial Invite Link`)
        .setURL('https://discord.gg/uRmbqKyvmQ')
        .setDescription(`https://discord.gg/uRmbqKyvmQ`)
        .setFooter('Cosmofficial by POPINxxCAPS');
        message.channel.send(embed)
    }
}