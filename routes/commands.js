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

    return res.status(404).json({
        message: 'This page is unavailable, coming soon.'
    })
    //res.render("singleServerGrids.ejs", data)
})

module.exports = router