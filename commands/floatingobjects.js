const floatingObjectModel = require('../models/floatingObjectSchema');


module.exports = {
  name: 'floatingobjects',
  aliases: ['fo'],
  description: "List all floating objects",
  permissions: ["SEND_MESSAGES"],
  async execute(message, args, cmd, client, discord, mainGuild, guild) {
    let floatingObjectsData = await floatingObjectModel.find({guildID: message.guild.id});
    let floatingObjectsString = '';
    for (i = 0; i < floatingObjectsData.length; i++) {
      if(floatingObjectsString.length > 950) {
        floatingObjectsString += `and ${floatingObjectsData.length - i} more...`
        break;
      }
      if (floatingObjectsData[i].DisplayName !== '') {
        floatingObjectsString += `${floatingObjectsData[i].name}\n`;
      }
    }
    if(floatingObjectsString === '') {
      floatingObjectsString = 'There are no floating objects to display.';
    }

    const embed = new discord.MessageEmbed()
      .setColor('#E02A6B')
      .setTitle('Server Info')
      .setURL('https://cosmofficial.herokuapp.com/')
      .addFields({
        name: 'Floating Objects',
        value: `${floatingObjectsString}`
      }, )
      .setFooter('Cosmofficial by POPINxxCAPS');

    message.channel.send(embed)
  }
}