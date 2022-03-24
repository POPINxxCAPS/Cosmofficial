const statusModel = require('../../models/statusSchema');
const createInvite = require('../discord/createInvite');
const queryStatus = require('../execution/queryStatus');
const timerFunction = require('../database/timerFunction');

module.exports = async (req) => {
    const guildID = req.guildID;
    const config = req.config;
    const client = req.client;
    let statusDoc = req.statusDoc
    req.expirationInSeconds = 15;
    req.name = 'logStatus'
    const timerCheck = await timerFunction(req)
    if (timerCheck === true) return; // If there is a timer, cancel.

    const current_time = Date.now();
    let servInfo = await queryStatus(config);

    if (statusDoc === undefined || statusDoc === null) {
        statusDoc = await statusModel.create({
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
            nextPopLog: current_time + 600000,
        })
    }



    if (servInfo === undefined) {
        if (statusDoc.serverOnline === true || statusDoc.serverOnline === undefined) { // If document says server is online, update to say offline
            statusDoc.serverOnline = false;
            statusDoc.save();
        }
        return;
    }


    if (statusDoc.serverOnline === false || statusDoc.serverOnline === undefined) { // If document says server is offline, update to say online
        statusDoc.serverOnline = true;
        statusDoc.save();
    }

    if (statusDoc === null || statusDoc === undefined) return;

    if (statusDoc.nextPopLog < current_time) {
        let invLink = "https://cosmofficial.herokuapp.com/"
        await createInvite(client, guildID).then(res => invLink = res)
        let popLogTimer = current_time + 600000;
        statusDoc.populationLog.push({
            playerCount: servInfo.Players,
            timestamp: current_time
        })
        statusDoc.simSpeedLog.push({
            simSpeed: servInfo.SimSpeed,
            timestamp: current_time
        })
        statusDoc.nextPopLog = popLogTimer;
        statusDoc.inviteLink = invLink;
    }

    statusDoc.game = servInfo.Game;
    statusDoc.isReady = servInfo.IsReady;
    statusDoc.pirateUsedPCU = servInfo.PirateUsedPCU;
    statusDoc.players = servInfo.Players;
    statusDoc.serverID = servInfo.ServerId;
    statusDoc.serverName = servInfo.ServerName;
    statusDoc.simSpeed = servInfo.SimSpeed;
    statusDoc.simCPULoad = servInfo.SimulationCpuLoad;
    statusDoc.usedPCU = servInfo.UsedPCU;
    statusDoc.version = servInfo.Version;
    statusDoc.worldName = servInfo.WorldName;
    statusDoc.lastUpdated = current_time;

    statusDoc.save();
    return;
}