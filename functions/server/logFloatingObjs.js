const floatingObjectModel = require('../../models/floatingObjectSchema');
const queryFloatingObjs = require("../execution/queryFloatingObjs");
const timerFunction = require('../database/timerFunction');

module.exports = async (req) => {
    const guildID = req.guildID;
    const config = req.config;
    const settings = req.settings;
    let entityIDs = [];
    let insertData = [];
    const statusDoc = req.statusDoc; // Confirm server is being reported as online before attempting query
    if (statusDoc === null || statusDoc.serverOnline === false || statusDoc.serverOnline === undefined) return null;


    let current_time = Date.now();
    const expirationInSeconds = 59;
    const expiration_time = current_time + (expirationInSeconds * 1000);
    req.expirationInSeconds = (req.gridQueryDelay * 0.75) / 1000 || 30;
    if (req.expirationInSeconds < 30) req.expirationInSeconds = 30;
    req.name = 'logFloatingObjs'
    const timer = await timerFunction(req);
    if (timer === true) return null; // If there is a timer, cancel.

    let floatingObjData = await queryFloatingObjs(config)
    if (floatingObjData === undefined) return;

    for (let i = 0; i < floatingObjData.length; i++) {
        const obj = floatingObjData[i];
        let doc = await floatingObjectModel.findOne({
            guildID: guildID,
            entityID: obj.EntityId
        })
        if (doc === null || doc === undefined) {
            doc = {
                guildID: guildID,
                name: obj.DisplayName,
                mass: obj.Mass,
                distanceToPlayer: obj.DistanceToPlayer,
                expirationTime: expiration_time,
                x: obj.Position.X,
                y: obj.Position.Y,
                z: obj.Position.Z
            }
            insertData.push(doc);
        } else {
            doc.name = obj.DisplayName;
            doc.mass = obj.Mass;
            doc.distanceToPlayer = obj.DistanceToPlayer;
            doc.expirationTime = expiration_time;
            doc.x = obj.Position.X;
            doc.y = obj.Position.Y;
            doc.z = obj.Position.Z;
            doc.save();
        }
    };
    await floatingObjectModel.insertMany(insertData);


    // Clear expired floating objects
    let floatingObjDocs = await floatingObjectModel.find({
        guildID: guildID
    });
    floatingObjDocs.forEach(doc => {
        if (doc.expirationTime < current_time && entityIDs.includes(doc.entityID) === false) {
            doc.remove();
        }
    })
    return;
}