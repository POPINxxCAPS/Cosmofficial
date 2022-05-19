
module.exports = {
    name: 'patreon',
    aliases: ['patron'],
    description: "Cosmofficial Patreon Link",
    permissions: ["SEND_MESSAGES"],
    category: "Support",
    categoryAliases: ['support'],
    async execute(req) {
        const message = req.message;
        const discord = req.discord;
        const embed =  new discord.MessageEmbed()
        .setColor('#E02A6B')
        .setTitle(`Cosmofficial Patreon Link`)
        .setURL('https://cosmofficial.herokuapp.com/')
        .setDescription(`Like the bot? Support it's development!\nMore support = more motivation. Thanks!\nhttps://patreon.com/Cosmofficial/`)
        .setFooter('Cosmofficial by POPINxxCAPS');
        message.channel.send(embed)
    }
}