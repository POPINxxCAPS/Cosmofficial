const express = require('express');
const router = express.Router();
const statusModel = require('../models/statusSchema');
const gridCount = require('../functions/misc/gridCount');
const verifyKey = require('../functions_oAuth/verifyKey');
const getUser = require('../functions_oAuth/getUser');
const getBotGuilds = require('../functions_oAuth/getBotGuilds');


// Get one server
router.get('/:username', verifyKey, async (req, res) => {
    const reqObj = {}; // Object for sending information to the page in one var
    reqObj.authURL = res.authURL;
    if(reqObj.authURL === 'Logged-In') {
        reqObj.user = await getUser(req.cookies['doaKey'])
    }
    const disClient = req.app.get("disClient");
    // If not logged in, return invalid request
    if (req.cookies['doaKey'] === undefined || req.cookies['doaKey'] === 'deleted') {
        return res.status(401).json({
            message: 'You must log in to view this page'
        })
    }

    try {
        let guilds = await getBotGuilds(req.cookies['doaKey'])
        reqObj.guilds = guilds;
    
        res.render("profilePage.ejs", { reqObj: reqObj });
    } catch (err) {
        console.log(err)
        return res.status(400).json({
            message: err
        })
    }

    
})

module.exports = router