const express = require('express');
const router = express.Router();
const statusModel = require('../models/statusSchema');
const getUser = require('../functions_oAuth/getUser');
const verifyKey = require('../functions_oAuth/verifyKey');
const checkPatron = require('../functions/misc/checkPatron');
const makeEcoSettingVar = require('../functions/misc/makeEcoSettingVar');



// Admin config page of one server
router.get('/:guildID', getGuildID, verifyKey, async (req, res) => {
    if(req.cookies['doaKey'] === 'deleted') return res.redirect("../")
    const disClient = req.app.get('disClient')

    //let guild = await disClient.guilds.cache.get(res.server.guildID);
    const economySettings = await makeEcoSettingVar(res.server.guildID);
    const user = await getUser(req.cookies['doaKey'])
    const patron = await checkPatron(disClient, user._id, res.server.guildID)

    const reqObj = {
        patron: patron,
        user: user,
        server: res.server,
        ecoSettings: economySettings,
    }
    res.render("adminConfig.ejs", {
        reqObj: reqObj
    })
})

// Setting modifiaction req handlings
router.get('/editSettings/:guildID'), function(req, res) {
    console.log('test')
    console.log(req.body)
    return res.redirect('../')
}


// Middlewares
async function getGuildID(req, res, next) {
    let server;
    try {
        server = await statusModel.findOne({
            guildID: req.params.guildID
        })
        if (server === null) {
            return res.status(404).json({
                message: 'GuildID was not found'
            })
        }
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
    res.server = server
    next()
    }


module.exports = router