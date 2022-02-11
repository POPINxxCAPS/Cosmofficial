const characterModel = require('../models/characterSchema');
const serverLogModel = require('../models/serverLogSchema');

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
    const expirationInSeconds = 29;
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

    // Start character query
    const characters = async (search) => {
        try {
            const path = `${sessionPath}/characters`;
            const {
                Characters
            } = await send('GET', path);
            const collection = Characters;

            return filterBySearch(collection, search);
        } catch (err) {
            console.log(`Character query for guild ID ${guildID} failed.`)
        }
    }

    let characterData;
    await characters().then((res) => {
        characterData = res
    }).catch(err => {});
    if (characterData === undefined) return;
    let entityIDs = [];
    for (let i = 0; i < characterData.length; i++) {
        let char = characterData[i];
        if (char.DisplayName !== '') {
            entityIDs.push(char.EntityId)
        }
        let doc = char.DisplayName === '' ? null : await characterModel.findOne({
            guildID: guildID,
            entityID: char.EntityId
        })
        if (doc === null || doc === undefined) {
            if (char.DisplayName !== '') {
                console.log(`t${char.DisplayName}t`)
                await characterModel.create({
                    guildID: guildID,
                    name: char.DisplayName,
                    mass: char.Mass,
                    entityID: char.EntityId,
                    expirationTime: expiration_time,
                    x: char.Position.X,
                    y: char.Position.Y,
                    z: char.Position.Z
                })
                console.log(`${char.DisplayName} Spawned`)
                await serverLogModel.create({
                    guildID: guildID,
                    category: 'character',
                    string: `${char.DisplayName} Spawned`
                })
            }
        } else {
            doc.mass = char.Mass,
                doc.entityID = char.EntityId,
                doc.expirationTime = expiration_time,
                doc.x = char.Position.X,
                doc.y = char.Position.Y,
                doc.z = char.Position.Z
            doc.save().catch(err => {});
        }
    };


    // Clear expired (dead) characters
    let characterDocs = await characterModel.find({
        guildID: guildID
    });
    characterDocs.forEach(async doc => {
        if (entityIDs.includes(doc.entityID) === false) {
            console.log(`${doc.name} died`)
            await serverLogModel.create({
                guildID: guildID,
                category: 'character',
                string: `${doc.name} Died`
            })
            doc.remove();
        }
    })
}