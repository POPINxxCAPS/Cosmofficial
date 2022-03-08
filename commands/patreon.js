
module.exports = {
    name: 'patreon',
    aliases: ['patron'],
    description: "List server chat messages",
    permissions: ["SEND_MESSAGES"],
    async execute(req) {
        const message = req.message;
        const discord = req.discord;
        const embed =  new discord.MessageEmbed()
        .setColor('#E02A6B')
        .setTitle(`Cosmofficial Patreon Link`)
        .setURL('https://cosmofficial.herokuapp.com/')
        .setDescription(`https://cosmofficial.herokuapp.com/`)
        .setFooter('Cosmofficial by POPINxxCAPS');
        message.channel.send(embed)
    }
}