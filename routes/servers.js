const express = require('express');
const router = express.Router();
const statusModel = require('../models/statusSchema');

// Get all servers
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
})
// Get one server
router.get('/:serverName', getServer, (req, res) => {
    res.send(res.server.serverName)
})

async function getServer(req, res, next) {
    let server;
 try {
    server = await statusModel.findOne({
        serverName: req.params.serverName
    })
    if(server === null) {
        return res.status(404).json({ message: 'Server name was not found'})
    }
 } catch (err) {
     return res.status(500).json({ message: err.message })
 }
 res.server = server
 next()
}

module.exports = router