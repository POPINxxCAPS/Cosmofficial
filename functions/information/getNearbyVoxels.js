const asteroidModel = require('../models/asteroidSchema');

module.exports = async (guildID, distance, x, y, z) => {
    let asteroidDocs = await asteroidModel.find({
        guildID: guildID
    })
    let data = [];

    if (asteroidDocs.length !== 0) {
        for (let i = 0; i < asteroidDocs.length; i++) {
            let item = asteroidDocs[i];
            var dx = x - item.x;
            var dy = y - item.y;
            var dz = z - item.z;

            let actualDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if(actualDistance <= distance) {
                data.push(item)
            }
        }
    }
    return data
}