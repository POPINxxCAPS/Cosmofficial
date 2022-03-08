
module.exports = {
    name: 'invite',
    aliases: ['invite'],
    description: "List server chat messages",
    permissions: ["SEND_MESSAGES"],
    async execute(req) {
        const message = req.message;
        const discord = req.discord;
        const embed =  new discord.MessageEmbed()
        .setColor('#E02A6B')
        .setTitle(`Cosmofficial Invite Link`)
        .setURL('https://discord.gg/uRmbqKyvmQ')
        .setDescription(`https://discord.gg/uRmbqKyvmQ`)
        .setFooter('Cosmofficial by POPINxxCAPS');
        message.channel.send(embed)
    }
}