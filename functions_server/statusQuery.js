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
                /*
                let firstDate;
                let lastDate;
                if (servInfoDoc.populationLog[0] !== undefined) {
                    firstDate = new Date(parseInt(servInfoDoc.populationLog[0].timestamp))
                }
                let date = new Date();
                let day = date.getDate();
                if (firstDate === undefined) return;
                // If the first data is the same day as today, do nothing.
                if (firstDate.getDate() !== day) {
                    // Chart Data Merging (one day per cycle, not hourly like the schema says)
                    let targetDay = firstDate.getDate();
                    let targetMonth = firstDate.getMonth();
                    console.log(targetMonth)
                    let dataToAvg = [];
                    let avg = 0;
                    console.log(new Date(parseInt(servInfoDoc.populationLog[0].timestamp)).getDate())
                    for (let i = 0; i < servInfoDoc.populationLog.length; i++) {
                        if (targetDay === new Date(parseInt(servInfoDoc.populationLog[i].timestamp)).getDate() && targetMonth === new Date(parseInt(servInfoDoc.populationLog[i].timestamp)).getMonth()) {
                            if (servInfoDoc.populationLog[i] !== undefined) {
                                // If day and month match targets, add data to array and remove entry
                                dataToAvg.push(parseInt(servInfoDoc.populationLog[i].playerCount))
                                lastDate = new Date(parseInt(servInfoDoc.populationLog[i].timestamp)).getTime();
                                servInfoDoc.populationLog[i].remove();
                                i - 1
                            }
                        }
                    }

                    let sum = 0;
                    for (let i = 0; i < dataToAvg.length; i++) {
                        sum += dataToAvg[i]
                    }
                    if (sum === 0) {
                        avg = 0;
                    } else {
                        avg = Math.round(((sum / dataToAvg.length) * 100)) / 100
                    }

                    servInfoDoc.hourlyPopulation.push({
                        avgPlayerCount: avg,
                        timestamp: lastDate
                    })
                }
                if (firstDate.getDate() !== day) {
                    // Chart Data Merging (one day per cycle, not hourly like the schema says)
                    let targetDay = firstDate.getDate();
                    let targetMonth = firstDate.getMonth();
                    let dataToAvg = [];
                    let avg = 0;
                    for (let i = 0; i < servInfoDoc.simSpeedLog.length; i++) {
                        if (targetDay === new Date(parseInt(servInfoDoc.simSpeedLog[i].timestamp)).getDate() && targetMonth === new Date(parseInt(servInfoDoc.simSpeedLog[i].timestamp)).getMonth()) {
                            if (servInfoDoc.simSpeedLog[i] !== undefined) {
                                // If day and month match targets, add data to array and remove entry
                                dataToAvg.push(parseFloat(servInfoDoc.simSpeedLog[i].simSpeed))
                                lastDate = new Date(parseInt(servInfoDoc.simSpeedLog[i].timestamp)).getTime();
                                console.log(lastDate)
                                servInfoDoc.simSpeedLog[i].remove();
                                i - 1
                            }
                        }
                    }
                    let sum = 0;
                    for (let i = 0; i < dataToAvg.length; i++) {
                        sum += dataToAvg[i]
                    }
                    if (sum === 0) {
                        avg = 0;
                    } else {
                        avg = Math.round(((sum / dataToAvg.length) * 100)) / 100
                    }

                    servInfoDoc.hourlySimSpeed.push({
                        avgSimSpeed: avg,
                        timestamp: lastDate
                    })
                }*/
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


            // Fix data stuff
            /*servInfoDoc.hourlyPopulation.forEach(entry => {
                for (let i = 0; servInfoDoc.hourlyPopulation.length; i++) {
                    if (servInfoDoc.hourlyPopulation[i] !== undefined) {
                        console.log(parseInt(entry.timestamp) - parseInt(servInfoDoc.hourlyPopulation[i].timestamp) < (3600 * 2) &&  parseInt(entry.timestamp) - parseInt(servInfoDoc.hourlyPopulation[i].timestamp) > (3600 * -2000))
                        console.log(parseInt(entry.timestamp) - parseInt(servInfoDoc.hourlyPopulation[i].timestamp))
                        if (parseInt(entry.timestamp) - parseInt(servInfoDoc.hourlyPopulation[i].timestamp) < (3600 * 2) && entry !== servInfoDoc.hourlyPopulation[i]) {
                            entry.remove();
                        }
                    }
                }
            })
            servInfoDoc.hourlySimSpeed.forEach(entry => {
                for (let i = 0; servInfoDoc.hourlySimSpeed.length; i++) {
                    if (servInfoDoc.hourlySimSpeed[i] !== undefined) {
                        if (parseInt(entry.timestamp) - parseInt(servInfoDoc.hourlySimSpeed[i].timestamp) < (3600 * 2) && entry !== servInfoDoc.hourlySimSpeed[i]) {
                            entry.remove();
                        }
                    }
                }
            })*/
            servInfoDoc.save();
        }

    } else {
        if (settings.serverOnline === true) { // If document says server is online, update to say offline
            settings.serverOnline = false;
            settings.save();
        }
    }
}