const express = require('express');
const router = express.Router();
const statusModel = require('../models/statusSchema');
const playerModel = require('../models/playerSchema');
let playerEcoModel = require('../models/playerEcoSchema');
const verificationModel = require('../models/verificationSchema');
const getGuildID = require('../functions/middleware/getGuildID');
const verifyKey = require('../functions_oAuth/verifyKey');
const getUser = require('../functions_oAuth/getUser');

// Get one server
router.get('/:guildID', getGuildID, verifyKey, async (req, res) => {
    const reqObj = {}; // Object for sending information to the page in one var
    reqObj.authURL = res.authURL;
    if (reqObj.authURL === 'Logged-In') {
        reqObj.user = await getUser(req.cookies['doaKey'])
    }

    // If there is a username mentioned, show the single user page
    if (req.query.username !== undefined) {
        const playerDoc = await playerModel.findOne({
            guildID: req.params.guildID,
            displayName: req.query.username
        })
        if (playerDoc === null) {
            return res.status(404).json({
                message: 'Error: 404. Page not found.'
            })
        }
        reqObj.server = req.server;
        reqObj.playerDoc = playerDoc;

        res.render("singleServerUser.ejs", {
            reqObj: reqObj
        });
    } else { // If no username mentioned, show all users
        const reqObj = {}; // Object for sending information to the page in one var
        reqObj.authURL = res.authURL;
        if (reqObj.authURL === 'Logged-In') {
            reqObj.user = await getUser(req.cookies['doaKey'])
        }
        const playerDocs = await playerModel.find({
            guildID: req.params.guildID
        })
        const users = playerDocs.sort((a, b) => ((a.lastLogin) > (b.lastLogin)) ? -1 : 1)
        reqObj.users = users;
        reqObj.server = res.server;
        reqObj.queryUsername = req.query.username;

        res.render("singleServerUsers.ejs", {
            reqObj: reqObj
        });
    }
})

module.exports = router