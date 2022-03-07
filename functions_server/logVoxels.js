const asteroidModel = require('../models/asteroidSchema');
const timerFunction = require('../functions_db/timerFunction');
const queryVoxels = require('../functions_execution/queryVoxels')
// "Asteroids" in the remote API path are actually modified voxel information.
let entityIDs = []; // Holding variable for the document deletions
module.exports = async (req, res) => {
    const guildID = req.guildID;
    const config = req.config;
    const settings = req.settings;
    if (settings.serverOnline === 'false' || settings.serverOnline === undefined || settings.serverOnline === false) return;
    req.expirationInSeconds = req.voxelQueryDelay / 1000 || 600;
    req.name = 'logVoxels'
    const timerCheck = await timerFunction(req)
    if (timerCheck === true) return null; // If there is a timer, cancel.
    const voxelData = await queryVoxels(config);
    const current_time = Date.now();
    const expiration_time = Math.round(current_time + ((req.expirationInSeconds * 1000) * 2))
    // Put an expiration on voxel documents to be able to tell when they respawn.

    if (voxelData === undefined) return null;

    for (let i = 0; i < voxelData.length; i++) {
        const asteroid = voxelData[i];
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


    // Clear expired voxel docs (respawned voxels)
    const asteroidDocs = await asteroidModel.find({
        guildID: guildID
    });

    asteroidDocs.forEach(doc => {
        if (entityIDs.includes(doc.entityID) === false) {
            doc.remove();
            console.log(`Modified Voxel for guild ID ${guildID} respawned`)
        }
    })
    const runTime = (Date.now() - current_time)
    return runTime
}