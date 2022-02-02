module.exports = {
    name: "bulkdelete",
    aliases: ['bd'],
    permissions: ["ADMINISTRATOR"],
    description: "Delete x messages from channel",
    async execute(message, args, cmd, client, discord, mainGuild, guild) {
        
        if(!args[0]) {
            message.channel.send('Specify a number of messages to delete')
            return 
        }
        if(args[0] > 100) {
          let i = 0;
          while(i < args[0]) {
            try {
              message.channel.bulkDelete(100)
            } catch(err) {}
            i += 100;
          }
        } else {
          try {
            message.channel.bulkDelete(args[0])
          } catch(err) {}
        }
    }
};