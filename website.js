const Express = require('express');
const mongoose = require('mongoose')
const { mongoDBLogin } = require('./env/env');
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

app.get("/", (req, res) => {
    res.send("Hello World")
}) // Sends information

app.use(Express.json()) // Allows website to use JSON data
app.listen(port, () => console.log('Website Online'))

const serverRouter = require('./routes/servers.js')
app.use('/servers', serverRouter) // Tells express to use the server router if this route is requested