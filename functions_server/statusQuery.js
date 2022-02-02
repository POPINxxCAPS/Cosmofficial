const statusModel = require('../models/statusSchema');

const serverPath = '/v1/server';


const axios = require('axios');
const crypto = require('crypto');
const JSONBI = require('json-bigint')({
    storeAsString: true,
    useNativeBigInt: true
});
const querystring = require('querystring');


module.exports = async (guildID, config, settings) => {
    const current_time = Date.now();
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

    const info = () => send('GET', serverPath);
    let servInfo;
    await info().then(res => {
        servInfo = res
    })
    if (servInfo !== undefined) {
        if (settings.serverOnline === false || settings.serverOnline === undefined) { // If document says server is offline, update to say online
            settings.serverOnline = true;
            settings.save();
        }

        let servInfoDoc = await statusModel.findOne({
            guildID: guildID,
        });
        if (servInfoDoc === null || servInfoDoc === undefined) {
            let popLogTimer = current_time + 300000
            let create = await statusModel.create({
                guildID: guildID,
                game: servInfo.Game,
                isReady: servInfo.IsReady,
                pirateUsedPCU: servInfo.PirateUsedPCU,
                players: servInfo.Players,
                serverID: servInfo.ServerId,
                serverName: servInfo.ServerName,
                simSpeed: servInfo.SimSpeed,
                simCPULoad: servInfo.SimulationCpuLoad,
                usedPCU: servInfo.UsedPCU,
                version: servInfo.Version,
                worldName: servInfo.WorldName,
                lastUpdated: current_time,
                nextPopLog: popLogTimer,
                populationLog: [],
                simSpeedLog: [],
                hourlyPopulation: [],
                hourlySimSpeed: [],
            })
            try {
                create.save();
            } catch (err) {
                console.log(err)
            }
        } else {
            if (servInfoDoc.nextPopLog < current_time && servInfoDoc.isReady === true) {
                let popLogTimer = current_time + 300000;
                servInfoDoc.populationLog.push({
                    playerCount: servInfo.Players,
                    timestamp: current_time
                })
                servInfoDoc.simSpeedLog.push({
                    simSpeed: servInfo.SimSpeed,
                    timestamp: current_time
                })
                servInfoDoc.nextPopLog = popLogTimer;
            }

            servInfoDoc.game = servInfo.Game;
            servInfoDoc.isReady = servInfo.IsReady;
            servInfoDoc.pirateUsedPCU = servInfo.PirateUsedPCU;
            servInfoDoc.players = servInfo.Players;
            servInfoDoc.serverID = servInfo.ServerId;
            servInfoDoc.serverName = servInfo.ServerName;
            servInfoDoc.simSpeed = servInfo.SimSpeed;
            servInfoDoc.simCPULoad = servInfo.SimulationCpuLoad;
            servInfoDoc.usedPCU = servInfo.UsedPCU;
            servInfoDoc.version = servInfo.Version;
            servInfoDoc.worldName = servInfo.WorldName;
            servInfoDoc.lastUpdated = current_time;


            let current_time = Date.now();
            for(let i = 0; i < servInfoDoc.populationLog.length; i++) {
                if(current_time - parseInt(servInfoDoc.populationLog[i].timestamp) < 1209600000) {
                    servInfoDoc.populationLog[i].remove()
                }
            }
            for(let i = 0; i < servInfoDoc.simSpeedLog.length; i++) {
                if(current_time - parseInt(servInfoDoc.simSpeedLog[i].timestamp) < 1209600000) {
                    servInfoDoc.simSpeedLog[i].remove()
                }
            }
            servInfoDoc.save();
        }

    } else {
        if (settings.serverOnline === true) { // If document says server is online, update to say offline
            settings.serverOnline = false;
            settings.save();
        }
    }
}