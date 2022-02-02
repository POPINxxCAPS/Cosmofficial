const floatingObjectModel = require('../models/floatingObjectSchema');

const {
    filterBySearch
} = require('../lib/modifiers');
const sessionPath = '/v1/session';


const axios = require('axios');
const crypto = require('crypto');
const JSONBI = require('json-bigint')({
    storeAsString: true,
    useNativeBigInt: true
});
const querystring = require('querystring');


module.exports = async (guildID, config, settings) => {
    if (settings.serverOnline === false || settings.serverOnline === undefined) return;
    let current_time = Date.now();
    const expirationInSeconds = 59;
    const expiration_time = current_time + (expirationInSeconds * 1000);
    const baseUrl = config.baseURL;
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
    // End Bridge Init

    // Start floating object query
    const floatingObjects = async (search) => {
        try {
            const path = `${sessionPath}/floatingObjects`;
            const {
                FloatingObjects
            } = await send('GET', path);
            const collection = FloatingObjects;

            return filterBySearch(collection, search);
        } catch (err) {
            console.log(`Floating Object query for guild ID ${guildID} failed.`);
        }

    };
    let floatingObjData;
    await floatingObjects().then((res) => {
        floatingObjData = res
    }).catch(err => {});
    if(floatingObjData === undefined) return;

    floatingObjData.forEach(async obj => {
        let doc = await floatingObjectModel.findOne({
            guildID: guildID,
            entityID: obj.EntityId
        })
        if(doc === null || doc === undefined) {
            floatingObjectModel.create({
                guildID: guildID,
                name: obj.DisplayName,
                mass: obj.Mass,
                distanceToPlayer: obj.DistanceToPlayer,
                expirationTime: expiration_time,
                x: obj.Position.X,
                y: obj.Position.Y,
                z: obj.Position.Z
            })
        } else {
                doc.name = obj.DisplayName,
                doc.mass = obj.Mass,
                doc.distanceToPlayer = obj.DistanceToPlayer,
                doc.expirationTime = expiration_time,
                doc.x = obj.Position.X,
                doc.y = obj.Position.Y,
                doc.z = obj.Position.Z
                doc.save();
        }
    });


    // Clear expired floating objects
    setTimeout(async () => {
        let current_time = Date.now();
        let floatingObjDocs = await floatingObjectModel.find({
            guildID: guildID
        });
        floatingObjDocs.forEach(doc => {
            if(doc.expirationTime < current_time) {
                doc.remove();
            }
        })
    }, 20000);
}