const chatModel = require('../models/chatSchema');
const playerModel = require('../models/playerSchema');
let loggedChats = [];
const {
    filterBySearch
} = require('../lib/modifiers');
const sessionPath = '/v1/session';
const serverPath = '/v1/server';


const axios = require('axios');
const crypto = require('crypto');
const JSONBI = require('json-bigint')({
    storeAsString: true,
    useNativeBigInt: true
});
const querystring = require('querystring');


module.exports = async (guildID, config, settings, client) => {
    if(settings.serverOnline === false || settings.serverOnline === undefined) return;
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


    const chat = async function ({
        count,
        date,
        message
    } = {}) {
        try {
            message = message || typeof arguments[0] === 'string' && arguments[0];

            let path = `${sessionPath}/chat`;

            if (message) {
                return send('POST', path, message);
            }

            if (typeof date === 'number') {
                // convert the time into c# date tick time
                const ticksPerMillisecond = 10000;
                const ticksSinceYearOne = 637329207590000000;
                date = new Date(date).getTime() * ticksPerMillisecond + ticksSinceYearOne;
            }

            const {
                Messages
            } = await send('GET', path, {
                qs: {
                    Date: date,
                    MessageCount: count
                }
            });

            return Messages;
        } catch (err) {
            console.log(`Chat query for guild ID ${guildID} failed.`)
        };
    };

    let chats;
    
    await chat().then(result => {
        chats = result;
    }).catch(err => {})

    if (chats !== undefined) {
        let chatHistory = await chatModel.findOne({
            guildID: guildID
        })
        if (chatHistory === null || chatHistory === [] || chatHistory === undefined || !chatHistory) {
            await chatModel.create({
                guildID: guildID,
                chatHistory: [],
            })
            chatHistory = await chatModel.findOne({
                guildID: guildID
            })
        }
        await chats.forEach(async singleChat => {
            if (loggedChats.includes(singleChat)) {} else {
                let msTimestamp = Date.now();
                let exists = false;
                singleChat.msTimestamp = msTimestamp
                for (let a = 0; a < chatHistory.chatHistory.length; a++) {
                    if (chatHistory.chatHistory[a].timestamp === singleChat.Timestamp) {
                        exists = true;
                    }
                }
                if (exists === false) {
                    console.log(singleChat)
                    chatHistory.chatHistory.push({
                        steamID: singleChat.SteamID,
                        displayName: singleChat.DisplayName,
                        content: singleChat.Content,
                        timestamp: singleChat.Timestamp,
                        msTimestamp: msTimestamp
                    })
                    let factionTag = ''
                    if(singleChat.DisplayName !== 'Good.bot') {
                        let playerDoc = await playerModel.findOne({
                            guildID: guildID,
                            displayName: singleChat.DisplayName
                        })
                        if(playerDoc !== null) {
                            factionTag = `[${playerDoc.factionTag}] `
                        }
                    }
                    const channel = client.channels.cache.get(settings.chatRelayChannel);
                    if (channel === null || channel === undefined) {} else {
                        const obscured = 'Message obscured due to GPS';
                        if (singleChat.Content.includes('GPS') || singleChat.Content.includes('Gps')) {
                            channel.send(`**${factionTag} ${singleChat.DisplayName}:** ${obscured}`);
                        } else {
                            channel.send(`**${singleChat.DisplayName}:** ${singleChat.Content}`)
                        }

                    }
                }
            }
        })
        chatHistory.save()
    }
}