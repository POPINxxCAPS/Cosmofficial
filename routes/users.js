const express = require('express');
const router = express.Router();
const statusModel = require('../models/statusSchema');
const playerModel = require('../models/playerSchema');
const playerEcoModel = require('../models/playerEcoSchema');

// Get one server
router.get('/:guildID', getGuildID, async (req, res) => {
    const server = await statusModel.findOne({
        guildID: req.params.guildID
    })

    const playerDocs = await playerModel.find({
        guildID: req.params.guildID
    })
    const users = playerDocs.sort((a, b) => ((a.lastLogin) > (b.lastLogin)) ? -1 : 1)
    const data = {
        server: server,
        users: users
    }

    res.render("singleServerUsers.ejs", data)
})

async function getGuildID(req, res, next) {
    let server;
 try {
    server = await statusModel.findOne({
        guildID: req.params.guildID
    })
    if(server === null) {
        return res.status(404).json({ message: 'GuildID was not found'})
    }
 } catch (err) {
     return res.status(500).json({ message: err.message })
 }
 res.server = server
 next()
}

module.exports = router