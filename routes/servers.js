const express = require('express');
const router = express.Router();
const statusModel = require('../models/statusSchema');
const gridCount = require('../functions/misc/gridCount');
const verifyKey = require('../functions_oAuth/verifyKey');
const getUser = require('../functions_oAuth/getUser');
const getGuildID = require('../functions/middleware/getGuildID');


// Get full server list
router.get('/', verifyKey, async (req, res) => {
    const reqObj = {}; // Object for sending information to the page in one var
    reqObj.authURL = res.authURL;
    if(reqObj.authURL === 'Logged-In') {
        reqObj.user = await getUser(req.cookies['doaKey'])
    }

    // Server list page
    reqObj.servers = await statusModel.find({
        serverName: { $ne: "Connection Error" },
        serverOnline: true
    }); // Get all status documents (to get server names)

    res.render('serverList.ejs', { reqObj: reqObj });
})

// Get one server
router.get('/single/:guildID', getGuildID, verifyKey, async (req, res) => {
    let count;
    await gridCount(req.params.guildID).then(result => { count = result });
    const reqObj = {}; // Object for sending information to the page in one var
    reqObj.authURL = res.authURL;
    if(reqObj.authURL === 'Logged-In') {
        reqObj.user = await getUser(req.cookies['doaKey'])
    }
    res.render("singleServer.ejs", {
        server: res.server,
        stations: count.stations,
        ships: count.ships,
        NPCs: count.NPCs
    })
})

module.exports = router