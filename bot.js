// Failed new code
const mongoose = require('mongoose')
const discord = require('discord.js');
const client = new discord.Client();
const prefix = 'a!';

client.commands = new discord.Collection();
client.events = new discord.Collection();
client.queryDelays = new discord.Collection();
client.gridDocCache = new discord.Collection();
client.lastGridDocCache = new discord.Collection();

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
const cooldownHandler = require('./handlers/cooldownHandler');

const serverLogHandler = require('./handlers/serverLogHandler');
const hotzoneHandler = require('./handlers/hotzoneHandler');
const dominationHandler = require('./handlers/dominationHandler');

const TDMServerHandler = require('./handlers/TDMServerHandler');
const TDMMatchHandler = require('./handlers/TDMMatchHandler');
const TDMDeathCounter = require('./counters/TDMDeathCounter');

const autoRoleCosmic = require('./cosmicOnly/autoRoleFunction');
const gridDeletionQueue = require('./cosmicOnly/hooverDeletionQueue');
const liveMapHandler = require('./cosmicOnly/liveMapHandler');
const spaceTicketEnforcer = require('./cosmicOnly/spaceTicketEnforcer')
const cosmicCharts = require('./cosmicOnly/charts')
const statusDocCleanup = require('./functions/misc/statusDocCleanup');
const updateChannelTickers = require('./functions/discord/updateChannelTickers');


client.on('ready', () => {
  statusDocCleanup(); // Only need to run this once per bot deploy

  //hotzoneHandler(client, discord); // Disabled until complete recode, noob code causing performancing problems
  serverDBHandler(client);
  //dominationHandler(client, discord);

  //TDMQueue(client); // Stuff for a TDM server nobody played, was shut down.
  //TDMServerHandler(client);
  //TDMMatchHandler(client);
  //TDMDeathCounter(client);


  //serverLogHandler(client, discord);
  //liveMapHandler(client)


  setInterval(cooldownHandler, 20000); // Just a cooldown wiping function for cooldowns created by commands.


  // Bot activity/channel tickers
  setInterval(async () => {
    updateChannelTickers(client);
  }, 300000)



  autoRoleCosmic(client);
  //gridDeletionQueue(client, discord) // Will create this for all
  //spaceTicketEnforcer(client) // Cosmic Network Only
  //cosmicCharts(client, discord); // Testing function for me, creates 3d scatter plot map of the server
})