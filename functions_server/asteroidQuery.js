const asteroidModel = require('../models/asteroidSchema');

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

let entityIDs = [];
module.exports = async (guildID, config, settings) => {
    if(settings.serverOnline === false) return;
    let current_time = Date.now();
    const expirationInSeconds = 299;
    const expiration_time = current_time + (expirationInSeconds * 1000);
    if (settings.serverOnline === 'false' || settings.serverOnline === undefined) return;
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
    const asteroids = async (search) => {
        try {
            const path = `${sessionPath}/asteroids`;
            const {
                Asteroids
            } = await send('GET', path);
            const collection = Asteroids;

            return filterBySearch(collection, search);
        } catch (err) {
            console.log(`Asteroid Query for guild ID ${guildID} failed.`);
        }

    };


    let asteroidData;
    await asteroids().then((res) => {
        asteroidData = res
    }).catch(err => {});
    if (asteroidData === undefined) return;

    for (let i = 0; i < asteroidData.length; i++) {
        const asteroid = asteroidData[i];
        let doc = await asteroidModel.findOne({
            guildID: guildID,
            entityID: asteroid.EntityId
        })
        if (doc === null || doc === undefined) {
            entityIDs.push(asteroid.EntityId)
            await asteroidModel.create({
                guildID: guildID,
                expirationTime: expiration_time,
                entityID: asteroid.EntityId,
                x: asteroid.Position.X,
                y: asteroid.Position.Y,
                z: asteroid.Position.Z
            })
            console.log(`Modified Voxel for guild ID ${guildID} created`)
        } else {
            entityIDs.push(asteroid.EntityId)

            doc.expirationTime = expiration_time;
            doc.x = asteroid.Position.X;
            doc.y = asteroid.Position.Y;
            doc.z = asteroid.Position.Z;
            doc.save();
        }
    };


    // Clear expired asteroids (respawned)
    const asteroidDocs = await asteroidModel.find({
        guildID: guildID
    });
    for(let i = 0; i < asteroidDocs.length; i++) {
        let doc = asteroidDocs[i];
        if (doc.expirationTime < current_time) {
            if(entityIDs.includes(doc.entityID)) {} else {
                try {
                    doc.remove();
                } catch (err) {}
                console.log(`Modified Voxel for guild ID ${guildID} respawned`)
            }
        }
    }
}