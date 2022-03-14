const statusModel = require('../models/statusSchema');
const createInvite = require('../functions_discord/createInvite');
const queryStatus = require('../functions_execution/queryStatus');
const timerFunction = require('../functions_db/timerFunction');

module.exports = async (req) => {
    const guildID = req.guildID;
    const config = req.config;
    const settings = req.settings;
    const client = req.client;
    req.expirationInSeconds = 15;
    req.name = 'logStatus'
    const timerCheck = await timerFunction(req)
    if (timerCheck === true) return; // If there is a timer, cancel.
    const current_time = Date.now();
    let servInfo = await queryStatus(config);
    if (servInfo === undefined) {
        if (settings.serverOnline === true) { // If document says server is online, update to say offline
            settings.serverOnline = false;
            settings.save();
        }
        return;
    }


    if (settings.serverOnline === false || settings.serverOnline === undefined) { // If document says server is offline, update to say online
        settings.serverOnline = true;
        settings.save();
    }

    let servInfoDoc = req.statusDoc !== null ? req.statuDoc : await statusModel.findOne({
        guildID: guildID,
    });
    if (servInfoDoc === null || servInfoDoc === undefined) { // If no status document, create one
        let invLink = "https://cosmofficial.herokuapp.com/"
        await createInvite(client, guildID).then(res => invLink = res)
        let popLogTimer = current_time + 300000
        await statusModel.create({
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
            serverOnline: true,
            inviteLink: invLink,
            populationLog: [],
            simSpeedLog: [],
            hourlyPopulation: [],
            hourlySimSpeed: [],

        })
        return;
    }


    if (servInfoDoc.nextPopLog < current_time) {
        let invLink = "https://cosmofficial.herokuapp.com/"
        await createInvite(client, guildID).then(res => invLink = res)
        let popLogTimer = current_time + 600000;
        servInfoDoc.populationLog.push({
            playerCount: servInfo.Players,
            timestamp: current_time
        })
        servInfoDoc.simSpeedLog.push({
            simSpeed: servInfo.SimSpeed,
            timestamp: current_time
        })
        servInfoDoc.nextPopLog = popLogTimer;
        servInfoDoc.inviteLink = invLink;
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

    servInfoDoc.save();
    return;
}