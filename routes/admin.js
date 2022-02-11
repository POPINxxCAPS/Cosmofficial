const express = require('express');
const router = express.Router();
const statusModel = require('../models/statusSchema');
const getUser = require('../functions_oAuth/getUser');
const verifyKey = require('../functions_oAuth/verifyKey');

// Get one server
router.get('/:guildID', getGuildID, verifyKey, async (req, res) => {
    if(req.cookies['doaKey'] === 'deleted') return res.status()
    const server = await statusModel.findOne({
        guildID: req.params.guildID
    })
    const user = await getUser(req.cookies['doaKey'])
    res.render("adminConfig.ejs", {
        user: user,
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