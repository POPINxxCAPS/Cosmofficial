const statusModel = require('../models/statusSchema');
module.exports = async () => {
    const statusDocs = await statusModel.find({});
    if(statusDocs.length === 0) return;
    for(let i = 0; i < statusDocs.length; i++) {
        for(let a = 0; a < statusDocs[i].populationLog.length; a++) {
            if(current_time - parseInt(statusDocs[i].populationLog[a].timestamp) < 1209600000) {
                statusDocs[i].populationLog[a].remove()
            }
        }
        for(let b = 0; b < statusDocs[i].simSpeedLog.length; b++) {
            if(current_time - parseInt(statusDocs[i].simSpeedLog[b].timestamp) < 1209600000) {
                statusDocs[i].simSpeedLog[b].remove()
            }
        }

        setTimeout(async () => {
            try {
                statusDocs[i].save();
            } catch(err) {}
        }, 5000)
    }
}