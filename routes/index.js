const express = require('express');
const router = express.Router();
var cookies = require('cookie-parser')
const client = require("../oAuth");
const statusModel = require('../models/statusSchema');
const getUser = require('../functions_oAuth/getUser');

router.use(cookies())
router.get('/', async (req, res) => { // Not using verifyKey middleware because this is the main login page
    const reqObj = {}; // Object for sending information to the page in one var
    reqObj.servers = await statusModel.find({
        serverName: { $ne: "Connection Error" },
        serverOnline: true
    }); // Get all status documents (to get server names)

    if (reqObj.servers.length === 0) return res.status(500).json({ // Return error if server documents fail to download
        message: err.message
    })


    // Check if user was previously logged in and attempt to refresh their oauth key
    if (req.cookies['doaKey'] !== undefined && req.cookies['doaKey'] !== 'deleted') { // If there is already an old key in the cookies
        try {
            let keyValidity = client.checkValidity(`${req.cookies['doaKey']}`);
            if (keyValidity.expired === true) { // If token expired === true, refresh and change the login button to home-page button
                const newKey = await client.refreshToken(req.cookies['doaKey']);
                keyValidity = client.checkValidity(`${req.cookies['doaKey']}`);
                if(keyValidity.expired === true) { // If token refresh failed, send them back to home page
                    res.render('index', {
                        servers: servers,
                        authURL: client.auth.link,
                    })
                } else { // If token refresh succeeded
                    const user = await getUser(req.cookies['doaKey'])
                    res.cookie('doaKey', newKey);
                    reqObj.authURL = "Logged-In"
                    reqObj.user = user;
                    res.render('index', {
                        reqObj: reqObj
                    })
                    
                }
            } else { // If current key (in cookies) is valid
                const user = await getUser(req.cookies['doaKey'])
                reqObj.user = user;
                reqObj.authURL = "Logged-In";
                res.render('index', {
                    reqObj: reqObj
                });
            }
        } catch (err) { // If there is an error refreshing their token, show the home page
            console.error(err);
            const {
                link,
                state
            } = client.auth;
            res.cookie('doaKey', 'deleted', {
                maxAge: -1
            });
            res.cookie('user-state', state);
            res.render('index', {
                reqObj: reqObj
            })
            
        }
    } else { // If no old key (or there's a deleted "state") stored in the cookies, show basic home page
        const {
            link,
            state
        } = client.auth;
        res.cookie('user-state', state);
        reqObj.authURL = client.auth.link;
        res.render('index', {
            reqObj: reqObj
        })
    }
    // Login Redirecting Complete
})


// Login Page Handling
router.get('/login', async (req, res) => {
    if (req.query.state !== undefined && req.query.code !== undefined && req.cookies['user-state'] !== undefined) {
        /*if (req.query.state === req.cookies['user-state']) {*/
            const userKey = await client.getAccess(req.query.code).catch(console.error);
            res.cookie('user-state', 'deleted', {
                maxAge: -1
            });
            res.cookie('doaKey', userKey);
            res.redirect('/');
        /*} else {
            res.send('States do not match. Nice try hackerman!');
        }*/
    } else {
        console.log(req.query.state)
        console.log(req.query.code)
        console.log(req.cookies['user-state'])
        res.send('Error: 502. Invalid login request.');
    }
});

// Sign-Out Page Handling
router.get('/signOut', async (req, res) => {
    if (req.cookies['doaKey'] !== undefined && req.cookies['doaKey'] !== 'deleted') {
            res.cookie('doaKey', 'deleted');
            res.redirect('/');
    } else {
        res.send('Error: 502. Invalid sign-out request.');
    }
});

module.exports = router
