const express = require('express');
const router = express.Router();
var cookies = require('cookie-parser')
const client = require("../oAuth");
const statusModel = require('../models/statusSchema');

router.use(cookies())
router.get('/', async (req, res) => {
    //const disClient = req.app.get("disClient"); Don't remember why I had this
    const servers = await statusModel.find({}); // Get all status documents (to get server names)
    if (servers.length === 0) return res.status(500).json({ // Return error if server documents fail to download
        message: err.message
    })


    // Check if user was previously logged in and attempt to refresh their oauth key
    if (req.cookies['doaKey'] !== undefined) { // If there is already an old key in the cookies
        try {
            let keyValidity = await client.checkValidity(`${req.cookies['doaKey']}`);
            if (keyValidity.expired === true) { // If token expired === true, refresh and change the login button to home-page button
                const newKey = await client.refreshToken(req.cookies['doaKey']);
                keyValidity = await client.checkValidity(`${req.cookies['doaKey']}`);
                if(keyValidity.expired === true) { // If token refresh failed, send them back to home page
                    res.render('index', {
                        servers: servers,
                        authURL: client.auth.link,
                    })
                    
                } else { // If token refresh succeeded
                    res.cookie('doaKey', newKey);
                    res.render('index', {
                        servers: servers,
                        authURL: "Logged-In",
                    })
                    
                }
            } else { // If current key (in cookies) is valid
                res.render('index', {
                    servers: servers,
                    authURL: "Logged-In",
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
                servers: servers,
                authURL: client.auth.link,
            })
            
        }
    } else { // If no old key stored in the cookies, show basic home page
        const {
            link,
            state
        } = client.auth;
        res.cookie('user-state', state);
        res.render('index', {
            servers: servers,
            authURL: client.auth.link,
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

module.exports = router
