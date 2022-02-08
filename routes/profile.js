const express = require('express');
const router = express.Router();
const statusModel = require('../models/statusSchema');
const gridCount = require('../functions_misc/gridCount');
const verifyKey = require('../functions_oAuth/verifyKey');
const getUser = require('../functions_oAuth/getUser');
const getBotGuilds = require('../functions_oAuth/getBotGuilds');


// Get one server
router.get('/:username', verifyKey, async (req, res) => {
    const disClient = req.app.get("disClient");
    // If not logged in, return invalid request
    if (req.cookies['doaKey'] === undefined || req.cookies['doaKey'] === 'deleted') {
        return res.status(401).json({
            message: 'You must log in to view this page'
        })
    }

    try {
        let user = await getUser(req.cookies['doaKey'])
        let guilds = await getBotGuilds(req.cookies['doaKey'])
        console.log(guilds)
        const data = {
            guilds: guilds,
            user: user
        }
    
        res.render("profilePage.ejs", data)
    } catch (err) {
        console.log(err)
        return res.status(400).json({
            message: err
        })
    }

    
})

module.exports = router