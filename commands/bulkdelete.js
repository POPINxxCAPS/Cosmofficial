module.exports = {
  name: "bulkdelete",
  aliases: ['bd'],
  permissions: ["ADMINISTRATOR"],
  description: "Delete x messages from channel.\nDoes not work for messages 7+ days old.",
  category: "Administration",
    categoryAliases: ['administration', 'admin'],
  async execute(req) {
    const message = req.message;
    const args = req.args;

    if (!args[0]) {
      message.channel.send('Specify a number of messages to delete')
      return
    }
    if (args[0] > 100) {
      let i = 0;
      while (i < args[0]) {
        try {
          message.channel.bulkDelete(100).catch(err => {})
        } catch (err) {}
        i += 100;
      }
    } else {
      try {
        message.channel.bulkDelete(args[0])
      } catch (err) {}
    }
  }
};