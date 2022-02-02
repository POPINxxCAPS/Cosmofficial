const {
    update
} = require('../models/TDMQueueSchema');
const TDMQueueModel = require('../models/TDMQueueSchema');
const TDMMatchModel = require('../models/TDMMatchSchema');
const TDMMessageHandler = require('../handlers/TDMMessageHandler');
const verificationModel = require('../models/verificationSchema');
module.exports = async (client) => {
    let current_time = Date.now();
    let timer = current_time + 30000;
    setInterval(async () => {
        current_time = Date.now();
        if (timer < current_time) {
            await TDMMessageHandler.updateQueue(client).catch((err) => console.log(err));
            timer = current_time + 30000
        }
        let expirationInSeconds = 15;
        let expirationTime = current_time + (expirationInSeconds * 1000);
        await client.channels.cache.get("884107552726597723").members.forEach(async (member) => { // For each member in the queue, check if there is a queue document made. If not create, if there is, update expiration time
            let queueDocument = await TDMQueueModel.findOne({
                userID: member.user.id
            });
            if (queueDocument === null || !queueDocument || queueDocument === undefined || queueDocument === []) { // If no queue document, create
                let verificationData = await verificationModel.findOne({
                    userID: member.user.id
                });
                if (verificationData === null || !verificationData || verificationData === undefined || verificationData === []) {} else { // If user is not verified, do not add them to the queue
                    queueDocument = await TDMQueueModel.create({
                        userID: member.user.id,
                        username: member.user.username,
                        gamertag: verificationData.username,
                        expirationTime: expirationTime
                    }).catch(err => { console.log(err) });
                    // Update queue document variable with the newly created doc
                }
            } else { // If there is a queue document created, update the expiration time
                queueDocument = await TDMQueueModel.findOneAndUpdate({
                    userID: member.user.id
                }, {
                    expirationTime: expirationTime
                });
                 // After updating the expiration, update the doc variable
            }
        });
        // After checking/updating each member document in the queue, check for expired queue documents (players that left the queue)
        let allQueueDocs = await TDMQueueModel.find({}).sort({
            'date': -1
        });
        await allQueueDocs.forEach(async (doc) => { // For each document, check if expired. If expired, delete.
            if (doc.expirationTime < current_time) {
                doc.remove();
            }
        });

        setTimeout(async () => {
            let updatedQueueDocs = await TDMQueueModel.find({}).sort({
                'date': -1
            });
    
            // Check if there are at least 2 people in the queue. If not, return.
            if (updatedQueueDocs.length <= 1) return;
            // If there are enough players to start, check if there is already a match going. If there is, return.
            let matchDoc = await TDMMatchModel.find({});
            if (matchDoc === null || matchDoc === [] || matchDoc === undefined || !matchDoc || matchDoc.length > 0) return;
            // If there is not a match already running, create a match document
            let startTime = current_time + (240 * 1000);
            let endTime = current_time + (60 * 1000) + (600 * 1000);
            let scoreLimit = 50;
            let teamOne = [];
            let teamTwo = [];
            let matchPlayerCount = 0;
            if (updatedQueueDocs.length >= 2) {
                matchPlayerCount = 1;
            }
            if (updatedQueueDocs.length >= 4) {
                matchPlayerCount = 3;
            }
            if (updatedQueueDocs.length >= 6) {
                matchPlayerCount = 5
            } // Finish match player count declaration
    
    
            for (let i = 0; i <= matchPlayerCount; i++) {
                if (i === 0 || i === 2 || i === 4) {
                    teamOne.push({
                        userID: updatedQueueDocs[i].userID,
                        username: updatedQueueDocs[i].username,
                        gamertag: updatedQueueDocs[i].gamertag
                    })
                }
                if (i === 1 || i === 3 || i === 5) {
                    teamTwo.push({
                        userID: updatedQueueDocs[i].userID,
                        username: updatedQueueDocs[i].username,
                        gamertag: updatedQueueDocs[i].gamertag
                    })
                }
            }
            await TDMMatchModel.create({
                teamOne: teamOne,
                teamTwo: teamTwo,
                matchStartTime: startTime,
                matchEndTime: endTime,
                scoreLimit: scoreLimit,
                teamOneScore: 0,
                teamTwoScore: 0,
                matchStarted: false
            });
        }, 2000)
    }, 10000);
}