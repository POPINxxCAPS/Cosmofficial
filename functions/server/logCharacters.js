const characterModel = require('../../models/characterSchema');
const serverLogModel = require('../../models/serverLogSchema');
const queryCharacters = require('../execution/queryCharacters');
const timerFunction = require('../database/timerFunction');

module.exports = async (req) => {
    const guildID = req.guildID;
    const settings = req.settings;
    const config = req.config;
    let insertData = [];
    let SLinsertData = [];

    const statusDoc = req.statusDoc; // Confirm server is being reported as online before attempting query
    if (statusDoc === null || statusDoc.serverOnline === false || statusDoc.serverOnline === undefined) return null;
    let current_time = Date.now();
    const expirationInSeconds = 29;
    const expiration_time = current_time + (expirationInSeconds * 1000);
    req.expirationInSeconds = (req.gridQueryDelay / 5) / 1000 || 20;
    if (req.expirationInSeconds < 20) req.expirationInSeconds = 20;
    req.name = 'logCharacters'
    const timer = await timerFunction(req);
    if (timer === true) return null; // If there is a timer, cancel.

    let characterData = await queryCharacters(config)
    if (characterData === undefined) return;
    let entityIDs = [];
    for (let i = 0; i < characterData.length; i++) {
        let char = characterData[i];
        entityIDs.push(char.EntityId)
        let doc = await characterModel.findOne({
            guildID: guildID,
            entityID: char.EntityId
        })
        if (doc === null || doc === undefined) {
            if (char.DisplayName === '') continue;
            let doc = {
                guildID: guildID,
                name: char.DisplayName,
                mass: char.Mass,
                entityID: char.EntityId,
                expirationTime: expiration_time,
                x: char.Position.X,
                y: char.Position.Y,
                z: char.Position.Z
            }
            insertData.push(doc)
            console.log(`${char.DisplayName} Spawned`)
            let SLDoc = {
                guildID: guildID,
                category: 'character',
                string: `${char.DisplayName} Spawned`
            }
            SLinsertData.push(SLDoc);
        } else {
            doc.mass = char.Mass;
            doc.entityID = char.EntityId;
            doc.expirationTime = expiration_time;
            doc.x = char.Position.X;
            doc.y = char.Position.Y;
            doc.z = char.Position.Z
            doc.save().catch(err => {});
        }
    };
    await characterModel.insertMany(insertData);

    // Clear expired (dead) characters
    let characterDocs = await characterModel.find({
        guildID: guildID
    });
    characterDocs.forEach(async doc => {
        if (entityIDs.includes(doc.entityID) === false) {
            console.log(`${doc.name} died`)
            let SLdoc = {
                guildID: guildID,
                category: 'character',
                string: `${doc.name} Died`
            }
            SLinsertData.push(SLdoc)
            doc.remove();
        }
    })

    await serverLogModel.insertMany(SLinsertData);

    return;
}