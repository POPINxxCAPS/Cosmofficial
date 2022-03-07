const characterModel = require('../models/characterSchema');
const serverLogModel = require('../models/serverLogSchema');
const queryCharacters = require('../functions_execution/queryCharacters');
const timerFunction = require('../functions_db/timerFunction');


module.exports = async (req) => {
    const guildID = req.guildID;
    const settings = req.settings;
    const config = req.config;

    if (settings.serverOnline === false || settings.serverOnline === undefined) return;
    let current_time = Date.now();
    const expirationInSeconds = 29;
    const expiration_time = current_time + (expirationInSeconds * 1000);
    req.expirationInSeconds = 30;
    req.name = 'logCharacters'
    const timer = await timerFunction(req);
    if (timer === true) return null; // If there is a timer, cancel.

    let characterData = await queryCharacters(config)
    if (characterData === undefined) return;
    let entityIDs = [];
    for (let i = 0; i < characterData.length; i++) {
        let char = characterData[i];
        if (char.DisplayName !== '') {
            entityIDs.push(char.EntityId)
        }
        let doc = char.DisplayName === '' ? null : await characterModel.findOne({
            guildID: guildID,
            entityID: char.EntityId
        })
        if (doc === null || doc === undefined) {
            if (char.DisplayName !== '') {
                console.log(`t${char.DisplayName}t`)
                await characterModel.create({
                    guildID: guildID,
                    name: char.DisplayName,
                    mass: char.Mass,
                    entityID: char.EntityId,
                    expirationTime: expiration_time,
                    x: char.Position.X,
                    y: char.Position.Y,
                    z: char.Position.Z
                })
                console.log(`${char.DisplayName} Spawned`)
                await serverLogModel.create({
                    guildID: guildID,
                    category: 'character',
                    string: `${char.DisplayName} Spawned`
                })
            }
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


    // Clear expired (dead) characters
    let characterDocs = await characterModel.find({
        guildID: guildID
    });
    characterDocs.forEach(async doc => {
        if (entityIDs.includes(doc.entityID) === false) {
            console.log(`${doc.name} died`)
            await serverLogModel.create({
                guildID: guildID,
                category: 'character',
                string: `${doc.name} Died`
            })
            doc.remove();
        }
    })
    return;
}