const express = require('express');
const router = express.Router();
const statusModel = require('../models/statusSchema');
const gridCount = require('../functions_misc/gridCount');

// Get all servers - No longer needed, index.js now handles main route
/*
router.get('/', async (req, res) => {
    try {
        const servers = await statusModel.find({}); // Get all status documents (to get server names)
        const serverNames = []
        for(let i = 0; i < servers.length; i++) {
            serverNames.push(servers[i].serverName)
        }
        res.json(serverNames)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})*/


// Get one server
router.get('/:guildID', getGuildID, async (req, res) => {
    let count;
    await gridCount(req.params.guildID).then(result => { count = result });

    const server = await statusModel.findOne({
        guildID: req.params.guildID
    })
    res.render("singleServer.ejs", {
        server: server,
        stations: count.stations,
        ships: count.ships,
        NPCs: count.NPCs
    })
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