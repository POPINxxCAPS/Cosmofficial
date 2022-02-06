const express = require('express');
const router = express.Router();
const statusModel = require('../models/statusSchema');
const gridCount = require('../functions_misc/gridCount');
const getGrids = require('../functions_db/getGrids');

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
    const grids = await getGrids(req.params.guildID)
    const data = {
        server: server,
        count: count,
        grids: grids,
    }

    res.render("singleServerGrids.ejs", data)
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