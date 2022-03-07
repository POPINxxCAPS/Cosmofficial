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
const serverDBHandler = require('./handlers/serverDBHandler');
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

const autoRoleCosmic = require('./cosmicOnly/autoRoleFunction');
const gridDeletionQueue = require('./cosmicOnly/hooverDeletionQueue');
const cleanupTimer = require('./cosmicOnly/cleanupTimer');
const liveMapHandler = require('./cosmicOnly/liveMapHandler');
const spaceTicketEnforcer = require('./cosmicOnly/spaceTicketEnforcer')
const cosmicCharts = require('./cosmicOnly/charts')
const statusDocCleanup = require('./functions_misc/statusDocCleanup');
const updateChannelTickers = require('./functions_discord/updateChannelTickers');


client.on('ready', () => {
  statusDocCleanup();

  //hotzoneHandler(client, discord); // Disabled until complete recode, noob code causing performancing problems
  serverDBHandler(client);
  //hooverHandler(client);
  dominationHandler(client, discord);

  //TDMQueue(client); // Stuff for a TDM server nobody played, was shut down.
  //TDMServerHandler(client);
  //TDMMatchHandler(client);
  //TDMDeathCounter(client);


  lotteryHandler(client, discord)
  serverLogHandler(client, discord);
  //liveMapHandler(client)


  setInterval(cooldownHandler, 20000);


  // Bot activity/channel tickers
  setInterval(async () => {
    updateChannelTickers(client);
  }, 300000)



  autoRoleCosmic(client);
  //cleanupTimer(client); // No longer needed
  //gridDeletionQueue(client, discord)
  //spaceTicketEnforcer(client)
  //cosmicCharts(client, discord);
})