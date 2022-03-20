
module.exports = {
    name: 'invite',
    aliases: ['invite'],
    description: "Invite link to the Cosmofficial Bot Discord.",
    permissions: ["SEND_MESSAGES"],
    category: "Support",
    categoryAliases: ['support'],
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