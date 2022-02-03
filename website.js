const Express = require('express');
const mongoose = require('mongoose')
const mongoDBLogin = process.env.mongoDBLogin || require('./env/env').mongoDBLogin
const statusModel = require('./models/statusSchema');
const ms = require('ms')

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

app.set('view engine', 'ejs')

app.get("/", async (req, res) => {
    const statusDocs = await statusModel.find({});

    //res.send("Hello World") // Just sends a stupid message to the web homepage
    res.render('index', { servers: statusDocs}) // Renders an EJS webpage - requires app.set above
}) // Sends information

app.use(Express.json()) // Allows website to use JSON data
app.listen(port, () => console.log('Website Online'))

const serverRouter = require('./routes/servers.js')
app.use('/servers', serverRouter) // Tells express to use the server router if this route is requested