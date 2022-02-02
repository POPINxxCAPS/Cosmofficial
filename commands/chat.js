const chatModel = require('../models/chatSchema');

module.exports = {
  name: 'chat',
  aliases: ['chat'],
  description: "List server chat messages",
  permissions: ["SEND_MESSAGES"],
  async execute(message, args, cmd, client, discord, mainGuild, guild) {
    let messageCount = 10;
    let index;
    let patronCheck = mainGuild.members.cache.get(message.guild.owner.user.id);
    if (!patronCheck) return message.channel.send('The owner of this discord must be in the Cosmofficial discord to enable usage of this command.');



    let chatDoc = await chatModel.findOne({
      guildID: message.guild.id
    });
    if (chatDoc === null || chatDoc === undefined || !chatDoc) return;
    let serverChats = await chatDoc.chatHistory.sort((a, b) => ((a.timestamp) > (b.timestamp)) ? 1 : -1);
    if(args[0] === undefined || !args[0] || args[0] === '') {
      index = 10;
    } else {
      if(parseInt(args[0]) % 1 != 0 ) return message.channel.send('Invalid command format. Valid: c!chat {page #}')
      index = 10 * parseInt(args[0]);
    }


    const obscured = 'Message obscured due to GPS';
    let x = serverChats.length - index;
    if (x < 0) {
      x = 0
    }
    let embedString = '';
    while (x < serverChats.length && messageCount > 0) {
      if (serverChats[x].content.includes('GPS') || serverChats[x].content.includes('Gps')) {
        embedString += `**${serverChats[x].displayName}**: ${obscured}\n`;
      } else {
        embedString += `**${serverChats[x].displayName}**: ${serverChats[x].content}\n`
      }
      x += 1;
      messageCount -= 1;
    }
    if (embedString === '') {
      embedString = 'No chat history'
    }
    const embed = new discord.MessageEmbed()
      .setColor('#E02A6B')
      .setTitle('In-Game Chat')
      .setURL('https://www.patreon.com/Cosmofficial')
      .setDescription('Showing recent in-game chats')
      .addFields({
        name: 'Chat History',
        value: `${embedString}`
      }, )
      .setFooter('Cosmofficial by POPINxxCAPS');

    message.channel.send(embed)
  }
}