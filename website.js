const Express = require('express');
const mongoose = require('mongoose')
const mongoDBLogin = process.env.mongoDBLogin || require('./env/env').mongoDBLogin
const statusModel = require('./models/statusSchema');
const ms = require('ms')

const discord = require('discord.js');
const client = new discord.Client()
const token = process.env.token || require('./env/env').token
client.login(token);
client.commands = new discord.Collection();

['command_handler'].forEach(handler => {
  require(`./handlers/${handler}`)(client, discord);
});

mongoose
  .connect(mongoDBLogin, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('Website connected to MongoDB!')
  })
  .catch((err) => {
    console.log(err)
  })

const app = Express();
const port = process.env.PORT || 3000;

app.use(Express.urlencoded({ extended: false }))
app.set('view engine', 'ejs')
app.set('disClient', client)


client.on('ready', async () => {
// Testing area


// Home Page Render
const homeRouter = require('./routes/index');
app.use('/', homeRouter);

/*app.get("/", async (req, res) => {
    const statusDocs = await statusModel.find({});
    //res.send("Hello World") // Just sends a stupid message to the web homepage
    //res.render('index', { servers: statusDocs}) // Renders an EJS webpage - requires app.set above
}) // Sends information */
// Home Page Render End

app.use(Express.json()) // Allows website to use JSON data
app.listen(port, () => console.log('Website Online')) // Just a verification message

// Server Page Router / Render
const serverRouter = require('./routes/servers')
app.use('/servers', serverRouter) // Tells express to use the server router if this route is requested

// Grid Page Router / Render
const gridRouter = require('./routes/grids');
app.use('/grids', gridRouter)

// User Page Router / Render
const userRouter = require('./routes/users');
app.use('/users', userRouter)

// Profile Page Router / Render
const profileRouter = require('./routes/profile');
app.use('/profile', profileRouter)

// Admin Page Router / Render
const adminRouter = require('./routes/admin');
app.use('/admin', adminRouter)

// Command Page Router / Render
const commandRouter = require('./routes/commands');
app.use('/commands', commandRouter)
})

