const statusModel = require('../models/statusSchema');
const createInvite = require('../functions_discord/createInvite');
const queryStatus = require('../functions_execution/queryStatus');
const timerFunction = require('../functions_db/timerFunction');

module.exports = async (req) => {
    const guildID = req.guildID;
    const config = req.config;
    const client = req.client;
    let statusDoc = req.statusDoc
    req.expirationInSeconds = 15;
    req.name = 'logStatus'
    const timerCheck = await timerFunction(req)
    console.log(`Timer: ${timerCheck}`);
    if (timerCheck === true) return; // If there is a timer, cancel.
    const current_time = Date.now();
    let servInfo = await queryStatus(config);
    if (servInfo === undefined) {
        if (statusDoc.serverOnline === true) { // If document says server is online, update to say offline
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