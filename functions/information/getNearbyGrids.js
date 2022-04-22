module.exports = async (client, guildID, distance, x, y, z) => {
    let gridDocs = client.gridDocCache.get(guildID);
    let data = [];
    if(gridDocs === undefined) return data;
    if (gridDocs.length !== 0) {
        for (let i = 0; i < gridDocs.length; i++) {
            let item = gridDocs[i];
            var dx = x - item.positionX;
            var dy = y - item.positionY;
            var dz = z - item.positionZ;

            let actualDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if(actualDistance <= distance) {
                data.push(item)
            }
        }
    }
    return data
}