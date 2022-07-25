const statusModel = require('../../models/statusSchema');
const createInvite = require('../discord/createInvite');
const queryStatus = require('../execution/queryStatus');
const timerFunction = require('../database/timerFunction');
const ms = require('ms');

module.exports = async (req) => {
    const guildID = req.guildID;
    const config = req.config;
    const client = req.client;
    const guild = await client.guilds.cache.get(guildID) || await client.guilds.cache.get(799685703910686720);
    const current_time = Date.now();
    let statusDoc = req.statusDoc;
    if (statusDoc === null) {
        statusDoc = await statusModel.create({
            guildID: guildID,
            game: 'Connection Error',
            isReady: false,
            pirateUsedPCU: 'Connection Error',
            players: 'Connection Error',
            serverID: 'Connection Error',
            serverName: 'Connection Error',
            simSpeed: 'Connection Error',
            simCPULoad: 'Connection Error',
            usedPCU: 'Connection Error',
            version: 'Connection Error',
            worldName: 'Connection Error',
            serverOnline: false,
            lastUpdated: current_time,
            nextPopLog: current_time + 600000,
            failedConnects: 0,
            nextConnectAttempt: 0
        })
    }
    let savedDoc;
    req.expirationInSeconds = 15;
    req.name = 'logStatus'
    const timerCheck = await timerFunction(req)
    if (timerCheck === true) return null; // If there is a timer, cancel.

    if(statusDoc.nextConnectAttempt > current_time) return null; // Offline server delay for performance reasons
    let servInfo = await queryStatus(config);

    if (servInfo.err !== undefined) { // If the query failed
        statusDoc.serverOnline = false;
        statusDoc.failedConnects = statusDoc.failedConnects === undefined ? 0 : parseInt(statusDoc.failedConnects) + 1;
        if (statusDoc.failedConnects >= 6) {
            statusDoc.nextConnectAttempt = current_time + (60000 * 15);
        } else { // DM the discord owner for attempt 3-5. Ignore 1-2 for restart lenience
            statusDoc.nextConnectAttempt = current_time + (60000 * parseInt(statusDoc.failedConnects));
            if (statusDoc.failedConnects >= 3 && statusDoc.failedConnects <= 5) {
                guild.owner.user.send(`**__Server Connection Error__**\n> Connection to ${config.ip} failed.\n> Error: ${servInfo.err}\n> Connection Attempt: **${statusDoc.failedConnects}** of **5**\n> Next Attempt: ${ms(parseInt(statusDoc.nextConnectAttempt) - current_time)}\n> \n> After 5 tries, an attempt will be made every 15 minutes.\n> Changing a remote setting will reset the counter.\n> First two notifs are skipped for restart lenience.`)
            }
        }
        await statusDoc.save().then(doc => { savedDoc = doc });
        return savedDoc;
    }

    // If the query was successful
    if (statusDoc.serverOnline === false || statusDoc.serverOnline === undefined) { // If document says server is offline, update to say online
        statusDoc.serverOnline = true;
        statusDoc.nextConnectAttempt = 0;
        statusDoc.failedConnects = 0;
    }

    if (statusDoc.nextPopLog < current_time) {
        let invLink = "https://cosmofficial.herokuapp.com/"
        await createInvite(client, guildID).then(res => invLink = res)
        if(invLink === null) await createInvite(client, "799685703910686720").then(res => invLink = res)
        let popLogTimer = current_time + 600000;
        statusDoc.populationLog.push({
            playerCount: servInfo.res.Players,
            timestamp: current_time
        })
        statusDoc.simSpeedLog.push({
            simSpeed: servInfo.res.SimSpeed,
            timestamp: current_time
        })
        statusDoc.nextPopLog = popLogTimer;
        statusDoc.inviteLink = invLink;
    }

    statusDoc.game = servInfo.res.Game;
    statusDoc.isReady = servInfo.res.IsReady;
    statusDoc.pirateUsedPCU = servInfo.res.PirateUsedPCU;
    statusDoc.players = servInfo.res.Players;
    statusDoc.serverID = servInfo.res.ServerId;
    statusDoc.serverName = servInfo.res.ServerName;
    statusDoc.simSpeed = servInfo.res.SimSpeed;
    statusDoc.simCPULoad = servInfo.res.SimulationCpuLoad;
    statusDoc.usedPCU = servInfo.res.UsedPCU;
    statusDoc.version = servInfo.res.Version;
    statusDoc.worldName = servInfo.res.WorldName;
    statusDoc.lastUpdated = current_time;

    await statusDoc.save().then(doc => { savedDoc = doc });
    return savedDoc;
}