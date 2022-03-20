const {
    filterBySearch
} = require('../../lib/modifiers');
const sessionPath = '/v1/session';


const axios = require('axios');
const crypto = require('crypto');
const JSONBI = require('json-bigint')({
    storeAsString: true,
    useNativeBigInt: true
});
const querystring = require('querystring');

module.exports = async (config) => {
    const baseUrl = config.ip;
    const port = config.port;
    const prefix = config.prefix;
    const secret = config.secret;

    const getNonce = () => crypto.randomBytes(20).toString('base64');
    const getUtcDate = () => new Date().toUTCString();

    const opts = (method, api, {
        body,
        qs
    } = {}) => {
        const url = `${baseUrl}:${port}${prefix}${api}`;
        const nonce = getNonce();
        const date = getUtcDate();
        const query = qs ? `?${querystring.stringify(qs)}` : '';

        const key = Buffer.from(secret, 'base64');
        const message = `${prefix}${api}${query}\r\n${nonce}\r\n${date}\r\n`;
        const hash = crypto.createHmac('sha1', key).update(Buffer.from(message)).digest('base64');

        return {
            url: url + query,
            headers: {
                Authorization: `${nonce}:${hash}`,
                Date: date
            },
            transformRequest(data) {
                return JSONBI.stringify(data);
            },
            transformResponse(data) {
                return JSONBI.parse(data);
            },
            json: true,
            body,
            method
        };
    };

    const send = (method, path, {
        body,
        qs,
        log = false
    } = {}) => {
        if (log) {
            console.log(`${method}: ${opts(method, path).url}`)
        }

        return axios(opts(method, path, {
                body,
                qs
            }))
            .then((result) => {
                if (log) {
                    console.log(result);
                }

                const {
                    data: {
                        data
                    }
                } = result;
                return data || {};
            })
            .catch(e => {
                return;
            });
    };
    const grids = async (search) => {
        try {
            const path = `${sessionPath}/grids`;
            const {
                Grids
            } = await send('GET', path)
            const collection = Grids;
            return filterBySearch(collection, search);
        } catch (err) {
            console.log(`Grid query for guild ID ${guildID} failed.`)
        }
    };

    let data;
    await grids().then((res) => {
        data = res;
    }).catch(err => {})

    return data;
}