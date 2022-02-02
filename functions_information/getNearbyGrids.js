const gridModel = require('../models/gridSchema');

module.exports = async (guildID, distance, x, y, z) => {
    let gridDocs = await gridModel.find({
        guildID: guildID
    })
    let data = [];

    if (gridDocs.length !== 0) {
        for (let i = 0; i < gridDocs.length; i++) {
            let item = gridDocs[i];
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