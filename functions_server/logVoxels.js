const asteroidModel = require('../models/asteroidSchema');
const timerFunction = require('../functions_db/timerFunction');
// "Asteroids" in the remote API path are actually modified voxel information.
let entityIDs = []; // Holding variable for the document deletions
module.exports = async (req, res) => {
    const guildID = req.guildID;
    const config = req.config;
    const settings = req.settings;
    if(settings.serverOnline === false) return;
    let current_time = Date.now();
    const expirationInSeconds = 299;
    const expiration_time = current_time + (expirationInSeconds * 1000);
    if (settings.serverOnline === 'false' || settings.serverOnline === undefined) return;
    const timerCheck = await timerFunction(req)
    const voxelData = await queryVoxels(config);

    if (voxelData === undefined) return;

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
        if (doc.expirationTime < current_time) {
            if(entityIDs.includes(doc.entityID)) {} else {
                try {
                    doc.remove();
                } catch (err) {}
                console.log(`Modified Voxel for guild ID ${guildID} respawned`)
            }
        }
    })
}