const characterModel = require('../../models/characterSchema');
const playerModel = require('../../models/playerSchema');

module.exports = async (guildID, distance, x, y, z) => {
    let characterDocs = await characterModel.find({
        guildID: guildID
    })
    let data = [];

    if (characterDocs.length !== 0) {
        for (let i = 0; i < characterDocs.length; i++) {
            let item = characterDocs[i];
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