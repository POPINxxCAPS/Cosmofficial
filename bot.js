// Failed new code
const mongoose = require('mongoose')
const discord = require('discord.js');
const client = new discord.Client();
const prefix = 'a!';

client.commands = new discord.Collection();
client.events = new discord.Collection();

['command_handler', 'event_handler'].forEach(handler => {
  require(`./handlers/${handler}`)(client, discord);
});

// Start MongoDB setup
const mongoDBLogin = process.env.mongoDBLogin || require('./env/env').mongoDBLogin
mongoose
  .connect(mongoDBLogin, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('Connected to MongoDB Database!')
  })
  .catch((err) => {
    console.log(err)
  })


// Finish MongoDB setup
// Start bot login
const token = process.env.token || require('./env/env').token
client.login(token);
// Finish bot login




// Start bot functions
const gridModel = require('./models/gridSchema');
const serverDBLoggingHandler = require('./handlers/serverDBLoggingHandler');
const hooverHandler = require('./handlers/hooverHandler');
const cooldownHandler = require('./handlers/cooldownHandler');

const lotteryHandler = require('./handlers/lotteryHandler');
const serverLogHandler = require('./handlers/serverLogHandler');
const hotzoneHandler = require('./handlers/hotzoneHandler');
const dominationHandler = require('./handlers/dominationHandler');

const TDMQueue = require('./functions_discord/TDMQueue');
const TDMServerHandler = require('./handlers/TDMServerHandler');
const TDMMatchHandler = require('./handlers/TDMMatchHandler');
const TDMDeathCounter = require('./counters/TDMDeathCounter');

const memberCounter = require('./counters/memberCounter');
const botGuildCounter = require('./counters/botGuildCounter');
const autoRoleCosmic = require('./cosmicOnly/autoRoleFunction');
const gridDeletionQueue = require('./cosmicOnly/hooverDeletionQueue');
const cleanupTimer = require('./cosmicOnly/cleanupTimer');
const liveMapHandler = require('./cosmicOnly/liveMapHandler');
const activePlayerCounter = require('./cosmicOnly/activePlayerCounter')
const spaceTicketEnforcer = require('./cosmicOnly/spaceTicketEnforcer')
const cosmicCharts = require('./cosmicOnly/charts')
const totalPlayTime = require('./cosmicOnly/totalPlayTime');
const statusDocCleanup = require('./functions_misc/statusDocCleanup');


client.on('ready', () => {
  statusDocCleanup();

  memberCounter(client);
  botGuildCounter(client);

  hotzoneHandler(client, discord);
  serverDBLoggingHandler(client);
  hooverHandler(client);
  dominationHandler(client, discord);

  //TDMQueue(client);
  //TDMServerHandler(client);
  //TDMMatchHandler(client);
  //TDMDeathCounter(client);


  lotteryHandler(client, discord)
  serverLogHandler(client, discord);
  //liveMapHandler(client)


  setInterval(cooldownHandler, 15000);


  // Bot activity messages
  const statusModel = require('./models/statusSchema');
  let placeholder = 0;
  setInterval(async () => {
    if (placeholder === 0) {
      let grids = await gridModel.find();
      client.user.setActivity(`${grids.length} Grids`, ({
        type: "WATCHING"
      }))
      placeholder = 1;
    } else if (placeholder === 1) {
      const statusDocs = await statusModel.find({})
      let servers = 0;
      statusDocs.forEach(doc => {
        if (doc.serverOnline === true) {
          servers += 1;
        }
      })
      client.user.setActivity(`${servers} Servers`, ({
        type: "WATCHING"
      }))
      placeholder = 0;
    }
  }, 180000)



  autoRoleCosmic(client);
  //cleanupTimer(client); // No longer needed
  activePlayerCounter(client)
  gridDeletionQueue(client, discord)
  spaceTicketEnforcer(client)
  //cosmicCharts(client, discord);
  totalPlayTime(client)
})