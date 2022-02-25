const statusModel = require('../models/statusSchema');
module.exports = async () => {
    const current_time = Date.now()
    const statusDocs = await statusModel.find({});
    if(statusDocs.length === 0) return;
    for(let i = 0; i < statusDocs.length; i++) {
        for(let a = 0; a < statusDocs[i].populationLog.length; a++) {
            if(current_time - parseInt(statusDocs[i].populationLog[a].timestamp) > 1209600000) {
                statusDocs[i].populationLog[a].remove()
            }
        }
        for(let b = 0; b < statusDocs[i].simSpeedLog.length; b++) {
            if(current_time - parseInt(statusDocs[i].simSpeedLog[b].timestamp) > 1209600000) {
                statusDocs[i].simSpeedLog[b].remove()
            }
        }
        console.log(`${statusDocs[i].serverName} Status Doc Cleaned`)
        setTimeout(async () => {
            try {
                await statusDocs[i].save();
            } catch(err) {}
        }, 10000)
    }
}