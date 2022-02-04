const express = require('express');
const router = express.Router();
var cookies = require('cookies')
const client = require("../oAuth");
const statusModel = require('../models/statusSchema');

router.use(cookies.express(['doaKey', 'user-state', 'deleted']))

router.get('/', async (req, res) => {
    const servers = await statusModel.find({}); // Get all status documents (to get server names)
    if (servers.length === 0) return res.status(500).json({ // Return error if server documents fail to download
        message: err.message
    })


    // Check if user was previously logged in and attempt to refresh their oauth key
    if (req.cookies['doaKey']) {
        try {
            const keyValidity = client.checkValidity(req.cookies['doaKey']);
            if (keyValidity.expired) { // If token expired, refresh and change the login button to home-page button
                const newKey = await client.refreshToken(req.cookies['doaKey']);
                res.cookie('doaKey', newKey);
                res.render('index', {
                    servers: servers,
                    authURL: "https://cosmofficial.herokuapp.com/",
                    button1Name: "Home Page"
                })
            } else {
                res.redirect('/');
            }
        } catch (err) { // If there is an error refreshing their token, show the default page with login button.
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
                button1Name: "Log-In"
            })
        }
    } else { // If no old key stored in the cookies, show basic home page with login button
        const {
            link,
            state
        } = client.auth;
        res.cookie('user-state', state);
        res.render('index', {
            servers: servers,
            authURL: client.auth.link,
            button1name: "Log-In"
        })
        console.log(client.auth.link)
    }
})


// Login Page Handling
router.get('/login', async (req, res) => {
    if (req.query.state && req.query.code && req.cookies['user-state']) {
        if (req.query.state === req.cookies['user-state']) {
            const userKey = await client.getAccess(req.query.code).catch(console.error);
            res.cookie('user-state', 'deleted', {
                maxAge: -1
            });
            res.cookie('doaKey', userKey);
            res.redirect('/user/');
        } else {
            res.send('States do not match. Nice try hackerman!');
        }
    } else {
        console.log(req.query.state && req.query.code && req.cookies['user-state'])
        res.send('Error: 502. Invalid login request.');
    }
});

// User Page Router


module.exports = router