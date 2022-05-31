const express = require('express');
const router = express.Router();
const statusModel = require('../models/statusSchema');
const gridCount = require('../functions/misc/gridCount');
const getGrids = require('../functions/database/getGrids');
const getGuildID = require('../functions/middleware/getGuildID');
const verifyKey = require('../functions_oAuth/verifyKey');
const getUser = require('../functions_oAuth/getUser');

// Get one server
router.get('/:guildID', getGuildID, verifyKey, async (req, res) => {
    const reqObj = {}; // Object for sending information to the page in one var
    reqObj.authURL = res.authURL;
    if(reqObj.authURL === 'Logged-In') {
        reqObj.user = await getUser(req.cookies['doaKey'])
    }
    let count;
    await gridCount(req.params.guildID).then(result => { count = result });
    const grids = await getGrids(req.params.guildID)
    reqObj.server = res.server;
    reqObj.count = count;
    reqObj.grids = grids;

    res.render("singleServerGrids.ejs", { reqObj: reqObj });
})

module.exports = router