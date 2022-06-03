const express = require('express');
const router = express.Router();
const verifyKey = require('../functions_oAuth/verifyKey');
const getUser = require('../functions_oAuth/getUser');

// Get one server
router.get('/', verifyKey, async (req, res) => {
    const reqObj = {}; // Object for sending information to the page in one var
    reqObj.authURL = res.authURL;
    if(reqObj.authURL === 'Logged-In') {
        reqObj.user = await getUser(req.cookies['doaKey'])
    }
    const disClient = req.app.get("disClient");
    const commands = disClient.commands;
    let commandPageInfo = [];
    for(const command of commands) {
        if(command[1].category === "Cosmic") continue;
        commandPageInfo.push({
            name: command[1].name,
            aliases: command[1].aliases,
            description: command[1].description,
            permissions: command[1].permissions,
            category: command[1].category,
            categoryAliases: command[1].categoryAliases
        })
    }
    reqObj.commands = commandPageInfo;
    res.render("commands.ejs", { reqObj: reqObj })
})

module.exports = router