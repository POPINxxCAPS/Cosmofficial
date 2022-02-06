const client = require('../oAuth');

const verify = async (req, res, next) => {
    if (req.cookies['doaKey'] !== undefined) {
        try {
            const validity = client.checkValidity(req.cookies['doaKey']);
            if (validity.expired) {
                const newKey = await client.refreshToken(req.cookies['doaKey']);
                res.cookie('doaKey', newKey);
            }
            next();
        } catch (err) {
            res.cookie('doaKey', 'deleted', {
                maxAge: -1
            });
            res.redirect('/');
        }
    } else res.redirect('/');
}

module.exports = verify;