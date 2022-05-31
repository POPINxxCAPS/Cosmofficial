const client = require('../oAuth');

const verify = async (req, res, next) => {
    if (req.cookies['doaKey'] !== undefined && req.cookies['doaKey'] !== 'deleted') {
        try {
            const validity = client.checkValidity(req.cookies['doaKey']);
            if (validity.expired === true) {
                const newKey = await client.refreshToken(req.cookies['doaKey']);
                res.cookie('doaKey', newKey);
            }
            res.authURL = "Logged-In"
            next();
        } catch (err) {
            res.cookie('doaKey', 'deleted', {
                maxAge: -1
            });
            res.redirect('/');
        }
    } else {
        res.authURL = client.auth.link;
        next();
    }
}

module.exports = verify;